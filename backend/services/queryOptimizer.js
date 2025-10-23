import { cacheService, cacheKeys } from './cacheService.js';
import { getPool } from '../config/database.js';

class QueryOptimizer {
  constructor() {
    this.queryCache = new Map();
    this.queryStats = new Map();
    this.pool = null;
  }

  async initializePool() {
    if (!this.pool) {
      this.pool = await getPool();
    }
    return this.pool;
  }

  // Execute optimized query with caching
  async executeQuery(queryName, query, params = [], cacheOptions = {}) {
    const {
      ttl = 300, // 5 minutes default cache
      useCache = true,
      keyGenerator = null
    } = cacheOptions;

    // Generate cache key
    const cacheKey = keyGenerator 
      ? keyGenerator(params)
      : `query:${queryName}:${JSON.stringify(params)}`;

    try {
      // Try to get from cache first
      if (useCache) {
        const cachedResult = await cacheService.get(cacheKey);
        if (cachedResult) {
          this.updateStats(queryName, 'cache_hit');
          return cachedResult;
        }
      }

      // Initialize pool if needed
      const pool = await this.initializePool();

      // Execute query
      const startTime = Date.now();
      const result = await pool.request()
        .input('params', JSON.stringify(params))
        .query(query);
      
      const executionTime = Date.now() - startTime;
      this.updateStats(queryName, 'db_hit', executionTime);

      // Cache the result
      if (useCache && result.recordset) {
        await cacheService.set(cacheKey, result.recordset, ttl);
      }

      return result.recordset || result;
    } catch (error) {
      this.updateStats(queryName, 'error');
      throw error;
    }
  }

  // Update query statistics
  updateStats(queryName, type, executionTime = 0) {
    if (!this.queryStats.has(queryName)) {
      this.queryStats.set(queryName, {
        cacheHits: 0,
        dbHits: 0,
        errors: 0,
        totalExecutionTime: 0,
        averageExecutionTime: 0
      });
    }

    const stats = this.queryStats.get(queryName);
    
    switch (type) {
      case 'cache_hit':
        stats.cacheHits++;
        break;
      case 'db_hit':
        stats.dbHits++;
        stats.totalExecutionTime += executionTime;
        stats.averageExecutionTime = stats.totalExecutionTime / stats.dbHits;
        break;
      case 'error':
        stats.errors++;
        break;
    }

    this.queryStats.set(queryName, stats);
  }

  // Get query statistics
  getQueryStats() {
    const stats = {};
    this.queryStats.forEach((value, key) => {
      stats[key] = {
        ...value,
        hitRate: value.cacheHits / (value.cacheHits + value.dbHits) || 0
      };
    });
    return stats;
  }

  // Optimized queries for common operations
  async getPopularCourses(category = null, limit = 10) {
    const cacheKey = cacheKeys.popularCourses(category || 'all');
    
    return this.executeQuery(
      'getPopularCourses',
      `EXEC sp_GetPopularCourses @Limit = ${limit}${category ? `, @Category = '${category}'` : ''}`,
      [category, limit],
      {
        ttl: 3600, // 1 hour
        keyGenerator: () => cacheKey
      }
    );
  }

  async getUserDashboard(userId) {
    return this.executeQuery(
      'getUserDashboard',
      `EXEC sp_GetUserDashboard @UserId = ${userId}`,
      [userId],
      {
        ttl: 300, // 5 minutes
        keyGenerator: () => cacheKeys.userCourses(userId)
      }
    );
  }

  async searchCourses(searchOptions) {
    const {
      searchTerm,
      category,
      minPrice,
      maxPrice,
      level,
      minRating,
      offset = 0,
      limit = 20
    } = searchOptions;

    return this.executeQuery(
      'searchCourses',
      `EXEC sp_SearchCourses 
        @SearchTerm = ${searchTerm ? `'${searchTerm}'` : 'NULL'},
        @Category = ${category ? `'${category}'` : 'NULL'},
        @MinPrice = ${minPrice || 'NULL'},
        @MaxPrice = ${maxPrice || 'NULL'},
        @Level = ${level ? `'${level}'` : 'NULL'},
        @MinRating = ${minRating || 'NULL'},
        @Offset = ${offset},
        @Limit = ${limit}`,
      [searchTerm, category, minPrice, maxPrice, level, minRating, offset, limit],
      {
        ttl: 600, // 10 minutes
        keyGenerator: () => cacheKeys.searchResults(searchTerm || '', {
          category, minPrice, maxPrice, level, minRating, offset, limit
        })
      }
    );
  }

  async getAnalyticsSummary(startDate, endDate) {
    return this.executeQuery(
      'getAnalyticsSummary',
      `EXEC sp_GetAnalyticsSummary @StartDate = '${startDate}', @EndDate = '${endDate}'`,
      [startDate, endDate],
      {
        ttl: 1800, // 30 minutes
        keyGenerator: () => `analytics:summary:${startDate}:${endDate}`
      }
    );
  }

  // Batch operations for better performance
  async getCoursesBatch(courseIds) {
    const cacheKeys = courseIds.map(id => `course:${id}`);
    const cached = await cacheService.mget(cacheKeys);
    
    // Find missing courses
    const missingIds = courseIds.filter(id => !cached[`course:${id}`]);
    
    const missingCourses = {};
    if (missingIds.length > 0) {
      const placeholders = missingIds.map(() => '?').join(',');
      const query = `
        SELECT * FROM Courses 
        WHERE id IN (${missingIds.join(',')}) AND status = 'published'
      `;
      
      const result = await this.executeQuery(
        'getCoursesBatch',
        query,
        missingIds,
        { useCache: false } // We'll cache individually
      );

      // Cache individual courses
      const cacheData = {};
      result.forEach(course => {
        const key = `course:${course.id}`;
        missingCourses[key] = course;
        cacheData[key] = course;
      });

      // Bulk cache the missing courses
      await cacheService.mset(cacheData, 3600); // 1 hour
    }

    // Combine cached and fresh data
    return courseIds.map(id => {
      const key = `course:${id}`;
      return cached[key] || missingCourses[key];
    }).filter(Boolean);
  }

  async getUsersBatch(userIds) {
    const cacheKeys = userIds.map(id => `user:${id}`);
    const cached = await cacheService.mget(cacheKeys);
    
    const missingIds = userIds.filter(id => !cached[`user:${id}`]);
    
    const missingUsers = {};
    if (missingIds.length > 0) {
      const query = `
        SELECT id, name, email, avatar, role, createdAt 
        FROM Users 
        WHERE id IN (${missingIds.join(',')})
      `;
      
      const result = await this.executeQuery(
        'getUsersBatch',
        query,
        missingIds,
        { useCache: false }
      );

      const cacheData = {};
      result.forEach(user => {
        const key = `user:${user.id}`;
        missingUsers[key] = user;
        cacheData[key] = user;
      });

      await cacheService.mset(cacheData, 1800); // 30 minutes
    }

    return userIds.map(id => {
      const key = `user:${id}`;
      return cached[key] || missingUsers[key];
    }).filter(Boolean);
  }

  // Query optimization helpers
  async optimizeQuery(query, params) {
    // Add query hints and optimizations
    const optimizedQuery = this.addQueryHints(query);
    return this.executeQuery('optimized', optimizedQuery, params);
  }

  addQueryHints(query) {
    // Add common SQL Server query hints
    let optimizedQuery = query;
    
    // Add OPTION hints for better performance
    if (!query.includes('OPTION')) {
      optimizedQuery += ' OPTION (RECOMPILE)';
    }
    
    // Add index hints for large tables
    optimizedQuery = optimizedQuery.replace(
      /FROM\s+(Courses|Users|Enrollments)\s+/gi,
      (match, tableName) => {
        const hints = {
          'Courses': 'WITH (INDEX(IX_Courses_Category))',
          'Users': 'WITH (INDEX(IX_Users_Email))',
          'Enrollments': 'WITH (INDEX(IX_Enrollments_UserCourse))'
        };
        return `FROM ${tableName} ${hints[tableName] || ''} `;
      }
    );
    
    return optimizedQuery;
  }

  // Cache invalidation for data changes
  async invalidateCacheForUser(userId) {
    await cacheService.invalidatePattern(`user:${userId}*`);
    await cacheService.invalidatePattern(`*user:${userId}*`);
  }

  async invalidateCacheForCourse(courseId) {
    await cacheService.invalidatePattern(`course:${courseId}*`);
    await cacheService.invalidatePattern(`*course:${courseId}*`);
    await cacheService.invalidatePattern('popular:*');
    await cacheService.invalidatePattern('search:*');
  }

  async invalidateCacheForCategory(category) {
    await cacheService.invalidatePattern(`*${category}*`);
    await cacheService.invalidatePattern('popular:*');
  }

  // Performance monitoring
  async getPerformanceMetrics() {
    const pool = await this.initializePool();
    return {
      queryStats: this.getQueryStats(),
      cacheStats: cacheService.getStats(),
      databaseConnections: {
        // Add database connection pool stats if available
        active: pool.pool?.available || 0,
        idle: pool.pool?.pending || 0
      }
    };
  }

  // Cleanup and maintenance
  async runMaintenance() {
    try {
      // Clear old query stats
      this.queryStats.clear();
      
      // Update database statistics
      await this.executeQuery(
        'updateStats',
        'UPDATE STATISTICS Users; UPDATE STATISTICS Courses; UPDATE STATISTICS Enrollments;',
        [],
        { useCache: false }
      );
      
      console.log('Database maintenance completed');
    } catch (error) {
      console.error('Database maintenance failed:', error);
    }
  }
}

// Create singleton instance
const queryOptimizer = new QueryOptimizer();

// Export for use in routes
export { queryOptimizer, QueryOptimizer };