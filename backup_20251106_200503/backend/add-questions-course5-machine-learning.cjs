const sql = require('mssql');

const config = {
  server: 'localhost',
  user: 'sa',
  password: '123456',
  database: 'MiniCoursera_Primary',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Course 5: Machine Learning - 5 MOOCs, 15 questions each
const questionsData = [
  {
    mooc_id: 15,
    mooc_name: 'Intro to Machine Learning',
    questions: [
      {
        stem: 'What is Machine Learning?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Programming computers to learn from data', is_correct: true },
          { label: 'B', content: 'Manual coding of all rules', is_correct: false },
          { label: 'C', content: 'Database management', is_correct: false },
          { label: 'D', content: 'Network configuration', is_correct: false },
        ],
      },
      {
        stem: 'Which of these is a supervised learning task?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Clustering customer segments', is_correct: false },
          { label: 'B', content: 'Predicting house prices', is_correct: true },
          { label: 'C', content: 'Anomaly detection', is_correct: false },
          { label: 'D', content: 'Data compression', is_correct: false },
        ],
      },
      {
        stem: 'What is a training dataset?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Data used to evaluate model', is_correct: false },
          { label: 'B', content: 'Data used to teach the model', is_correct: true },
          { label: 'C', content: 'Data for production use', is_correct: false },
          { label: 'D', content: 'Data for visualization', is_correct: false },
        ],
      },
      {
        stem: 'What is overfitting?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Model performs well on training data but poorly on new data', is_correct: true },
          { label: 'B', content: 'Model performs poorly on all data', is_correct: false },
          { label: 'C', content: 'Model is too simple', is_correct: false },
          { label: 'D', content: 'Model trains too quickly', is_correct: false },
        ],
      },
      {
        stem: 'What is feature engineering?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Creating and selecting input variables', is_correct: true },
          { label: 'B', content: 'Choosing ML algorithms', is_correct: false },
          { label: 'C', content: 'Designing databases', is_correct: false },
          { label: 'D', content: 'Writing documentation', is_correct: false },
        ],
      },
      {
        stem: 'What is a test dataset used for?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Training the model', is_correct: false },
          { label: 'B', content: 'Evaluating model performance', is_correct: true },
          { label: 'C', content: 'Storing results', is_correct: false },
          { label: 'D', content: 'Cleaning data', is_correct: false },
        ],
      },
      {
        stem: 'What is cross-validation?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Technique to assess model performance using multiple splits', is_correct: true },
          { label: 'B', content: 'Method to clean data', is_correct: false },
          { label: 'C', content: 'Way to compress models', is_correct: false },
          { label: 'D', content: 'Database validation', is_correct: false },
        ],
      },
      {
        stem: 'What is a label in supervised learning?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'The target variable we want to predict', is_correct: true },
          { label: 'B', content: 'The input features', is_correct: false },
          { label: 'C', content: 'The algorithm name', is_correct: false },
          { label: 'D', content: 'The dataset size', is_correct: false },
        ],
      },
      {
        stem: 'What is the purpose of normalization?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Scale features to similar ranges', is_correct: true },
          { label: 'B', content: 'Remove outliers', is_correct: false },
          { label: 'C', content: 'Add more features', is_correct: false },
          { label: 'D', content: 'Increase dataset size', is_correct: false },
        ],
      },
      {
        stem: 'What is bias in ML models?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Error from overly simplistic assumptions', is_correct: true },
          { label: 'B', content: 'Error from too much complexity', is_correct: false },
          { label: 'C', content: 'Random noise in data', is_correct: false },
          { label: 'D', content: 'Computational cost', is_correct: false },
        ],
      },
      {
        stem: 'What is variance in ML models?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Error from sensitivity to training data fluctuations', is_correct: true },
          { label: 'B', content: 'Error from simple models', is_correct: false },
          { label: 'C', content: 'Data preprocessing error', is_correct: false },
          { label: 'D', content: 'Hardware limitation', is_correct: false },
        ],
      },
      {
        stem: 'What is the bias-variance tradeoff?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Balance between model simplicity and complexity', is_correct: true },
          { label: 'B', content: 'Choice between algorithms', is_correct: false },
          { label: 'C', content: 'Speed vs accuracy', is_correct: false },
          { label: 'D', content: 'Cost vs performance', is_correct: false },
        ],
      },
      {
        stem: 'What is ensemble learning?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Combining multiple models for better predictions', is_correct: true },
          { label: 'B', content: 'Using one powerful model', is_correct: false },
          { label: 'C', content: 'Training on multiple datasets', is_correct: false },
          { label: 'D', content: 'Parallel computing', is_correct: false },
        ],
      },
      {
        stem: 'What is a confusion matrix?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Table showing classification results', is_correct: true },
          { label: 'B', content: 'Error measurement tool', is_correct: false },
          { label: 'C', content: 'Data visualization chart', is_correct: false },
          { label: 'D', content: 'Training progress tracker', is_correct: false },
        ],
      },
      {
        stem: 'What is accuracy in classification?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Percentage of correct predictions', is_correct: true },
          { label: 'B', content: 'Training speed', is_correct: false },
          { label: 'C', content: 'Model size', is_correct: false },
          { label: 'D', content: 'Number of features', is_correct: false },
        ],
      },
    ],
  },
  {
    mooc_id: 16,
    mooc_name: 'Supervised Learning',
    questions: [
      {
        stem: 'What is Linear Regression used for?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Predicting continuous values', is_correct: true },
          { label: 'B', content: 'Classifying categories', is_correct: false },
          { label: 'C', content: 'Clustering data', is_correct: false },
          { label: 'D', content: 'Reducing dimensions', is_correct: false },
        ],
      },
      {
        stem: 'What is Logistic Regression used for?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Binary classification', is_correct: true },
          { label: 'B', content: 'Predicting numbers', is_correct: false },
          { label: 'C', content: 'Clustering', is_correct: false },
          { label: 'D', content: 'Time series', is_correct: false },
        ],
      },
      {
        stem: 'What is a Decision Tree?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Tree-like model of decisions', is_correct: true },
          { label: 'B', content: 'Linear model', is_correct: false },
          { label: 'C', content: 'Neural network', is_correct: false },
          { label: 'D', content: 'Clustering algorithm', is_correct: false },
        ],
      },
      {
        stem: 'What is Random Forest?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Ensemble of decision trees', is_correct: true },
          { label: 'B', content: 'Single decision tree', is_correct: false },
          { label: 'C', content: 'Linear model', is_correct: false },
          { label: 'D', content: 'Clustering method', is_correct: false },
        ],
      },
      {
        stem: 'What is K-Nearest Neighbors (KNN)?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Algorithm that classifies based on nearest data points', is_correct: true },
          { label: 'B', content: 'Tree-based algorithm', is_correct: false },
          { label: 'C', content: 'Linear regression variant', is_correct: false },
          { label: 'D', content: 'Neural network type', is_correct: false },
        ],
      },
      {
        stem: 'What is Support Vector Machine (SVM)?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Algorithm that finds optimal separating hyperplane', is_correct: true },
          { label: 'B', content: 'Tree-based classifier', is_correct: false },
          { label: 'C', content: 'Clustering method', is_correct: false },
          { label: 'D', content: 'Regression technique', is_correct: false },
        ],
      },
      {
        stem: 'What is the kernel trick in SVM?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Transform data to higher dimensions for linear separation', is_correct: true },
          { label: 'B', content: 'Reduce training time', is_correct: false },
          { label: 'C', content: 'Combine multiple models', is_correct: false },
          { label: 'D', content: 'Normalize features', is_correct: false },
        ],
      },
      {
        stem: 'What is Gradient Descent?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Optimization algorithm to minimize loss', is_correct: true },
          { label: 'B', content: 'Classification algorithm', is_correct: false },
          { label: 'C', content: 'Data preprocessing method', is_correct: false },
          { label: 'D', content: 'Feature selection technique', is_correct: false },
        ],
      },
      {
        stem: 'What is the learning rate?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Step size in gradient descent', is_correct: true },
          { label: 'B', content: 'Model accuracy', is_correct: false },
          { label: 'C', content: 'Training speed', is_correct: false },
          { label: 'D', content: 'Number of iterations', is_correct: false },
        ],
      },
      {
        stem: 'What is regularization?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Technique to prevent overfitting', is_correct: true },
          { label: 'B', content: 'Method to speed up training', is_correct: false },
          { label: 'C', content: 'Way to clean data', is_correct: false },
          { label: 'D', content: 'Feature engineering approach', is_correct: false },
        ],
      },
      {
        stem: 'What is L1 regularization (Lasso)?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Adds absolute value of coefficients to loss', is_correct: true },
          { label: 'B', content: 'Adds squared coefficients to loss', is_correct: false },
          { label: 'C', content: 'Removes features randomly', is_correct: false },
          { label: 'D', content: 'Increases learning rate', is_correct: false },
        ],
      },
      {
        stem: 'What is L2 regularization (Ridge)?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Adds squared coefficients to loss', is_correct: true },
          { label: 'B', content: 'Adds absolute value of coefficients', is_correct: false },
          { label: 'C', content: 'Removes outliers', is_correct: false },
          { label: 'D', content: 'Scales features', is_correct: false },
        ],
      },
      {
        stem: 'What is precision in classification?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'True positives / (True positives + False positives)', is_correct: true },
          { label: 'B', content: 'True positives / (True positives + False negatives)', is_correct: false },
          { label: 'C', content: 'Correct predictions / Total predictions', is_correct: false },
          { label: 'D', content: 'Training accuracy', is_correct: false },
        ],
      },
      {
        stem: 'What is recall in classification?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'True positives / (True positives + False negatives)', is_correct: true },
          { label: 'B', content: 'True positives / (True positives + False positives)', is_correct: false },
          { label: 'C', content: 'Correct predictions / Total predictions', is_correct: false },
          { label: 'D', content: 'Model confidence', is_correct: false },
        ],
      },
      {
        stem: 'What is the F1 score?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Harmonic mean of precision and recall', is_correct: true },
          { label: 'B', content: 'Arithmetic mean of precision and recall', is_correct: false },
          { label: 'C', content: 'Maximum of precision and recall', is_correct: false },
          { label: 'D', content: 'Sum of precision and recall', is_correct: false },
        ],
      },
    ],
  },
  {
    mooc_id: 17,
    mooc_name: 'Unsupervised Learning',
    questions: [
      {
        stem: 'What is unsupervised learning?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Learning from unlabeled data', is_correct: true },
          { label: 'B', content: 'Learning with target labels', is_correct: false },
          { label: 'C', content: 'Learning with rewards', is_correct: false },
          { label: 'D', content: 'Learning from experts', is_correct: false },
        ],
      },
      {
        stem: 'What is K-Means clustering?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Algorithm that groups data into K clusters', is_correct: true },
          { label: 'B', content: 'Classification algorithm', is_correct: false },
          { label: 'C', content: 'Regression method', is_correct: false },
          { label: 'D', content: 'Neural network', is_correct: false },
        ],
      },
      {
        stem: 'What is hierarchical clustering?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Builds tree of clusters', is_correct: true },
          { label: 'B', content: 'Creates K fixed clusters', is_correct: false },
          { label: 'C', content: 'Linear clustering', is_correct: false },
          { label: 'D', content: 'Random clustering', is_correct: false },
        ],
      },
      {
        stem: 'What is DBSCAN?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Density-based clustering algorithm', is_correct: true },
          { label: 'B', content: 'Distance-based classifier', is_correct: false },
          { label: 'C', content: 'Linear regression variant', is_correct: false },
          { label: 'D', content: 'Tree-based method', is_correct: false },
        ],
      },
      {
        stem: 'What is Principal Component Analysis (PCA)?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Dimensionality reduction technique', is_correct: true },
          { label: 'B', content: 'Classification algorithm', is_correct: false },
          { label: 'C', content: 'Clustering method', is_correct: false },
          { label: 'D', content: 'Data cleaning tool', is_correct: false },
        ],
      },
      {
        stem: 'What is the elbow method?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Method to find optimal K in K-Means', is_correct: true },
          { label: 'B', content: 'Feature selection technique', is_correct: false },
          { label: 'C', content: 'Data normalization method', is_correct: false },
          { label: 'D', content: 'Training optimization', is_correct: false },
        ],
      },
      {
        stem: 'What is anomaly detection?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Identifying unusual patterns in data', is_correct: true },
          { label: 'B', content: 'Finding clusters', is_correct: false },
          { label: 'C', content: 'Predicting categories', is_correct: false },
          { label: 'D', content: 'Reducing dimensions', is_correct: false },
        ],
      },
      {
        stem: 'What is association rule learning?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Finding relationships between variables', is_correct: true },
          { label: 'B', content: 'Classification method', is_correct: false },
          { label: 'C', content: 'Regression technique', is_correct: false },
          { label: 'D', content: 'Neural network type', is_correct: false },
        ],
      },
      {
        stem: 'What is the Apriori algorithm?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Algorithm for finding frequent itemsets', is_correct: true },
          { label: 'B', content: 'Clustering algorithm', is_correct: false },
          { label: 'C', content: 'Classification method', is_correct: false },
          { label: 'D', content: 'Optimization technique', is_correct: false },
        ],
      },
      {
        stem: 'What is t-SNE?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Dimensionality reduction for visualization', is_correct: true },
          { label: 'B', content: 'Clustering algorithm', is_correct: false },
          { label: 'C', content: 'Classification method', is_correct: false },
          { label: 'D', content: 'Data augmentation technique', is_correct: false },
        ],
      },
      {
        stem: 'What is autoencoders?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Neural networks for unsupervised feature learning', is_correct: true },
          { label: 'B', content: 'Supervised classifiers', is_correct: false },
          { label: 'C', content: 'Clustering algorithms', is_correct: false },
          { label: 'D', content: 'Data preprocessing tools', is_correct: false },
        ],
      },
      {
        stem: 'What is the silhouette score?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Measure of clustering quality', is_correct: true },
          { label: 'B', content: 'Classification accuracy', is_correct: false },
          { label: 'C', content: 'Regression error', is_correct: false },
          { label: 'D', content: 'Training speed metric', is_correct: false },
        ],
      },
      {
        stem: 'What is Gaussian Mixture Model (GMM)?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Probabilistic clustering model', is_correct: true },
          { label: 'B', content: 'Classification algorithm', is_correct: false },
          { label: 'C', content: 'Regression method', is_correct: false },
          { label: 'D', content: 'Feature extraction', is_correct: false },
        ],
      },
      {
        stem: 'What is the curse of dimensionality?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Problems arising from high-dimensional spaces', is_correct: true },
          { label: 'B', content: 'Too few features', is_correct: false },
          { label: 'C', content: 'Small dataset size', is_correct: false },
          { label: 'D', content: 'Slow training speed', is_correct: false },
        ],
      },
      {
        stem: 'What is manifold learning?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Learning low-dimensional structure in high-dimensional data', is_correct: true },
          { label: 'B', content: 'Supervised classification', is_correct: false },
          { label: 'C', content: 'Data augmentation', is_correct: false },
          { label: 'D', content: 'Feature scaling', is_correct: false },
        ],
      },
    ],
  },
  {
    mooc_id: 18,
    mooc_name: 'Neural Networks & Deep Learning',
    questions: [
      {
        stem: 'What is a neural network?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Computing system inspired by biological brains', is_correct: true },
          { label: 'B', content: 'Linear regression model', is_correct: false },
          { label: 'C', content: 'Decision tree', is_correct: false },
          { label: 'D', content: 'Clustering algorithm', is_correct: false },
        ],
      },
      {
        stem: 'What is a perceptron?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Simplest type of neural network', is_correct: true },
          { label: 'B', content: 'Deep learning model', is_correct: false },
          { label: 'C', content: 'Clustering method', is_correct: false },
          { label: 'D', content: 'Data structure', is_correct: false },
        ],
      },
      {
        stem: 'What is an activation function?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Function that introduces non-linearity', is_correct: true },
          { label: 'B', content: 'Loss function', is_correct: false },
          { label: 'C', content: 'Optimization algorithm', is_correct: false },
          { label: 'D', content: 'Data preprocessing step', is_correct: false },
        ],
      },
      {
        stem: 'What is the ReLU activation function?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'max(0, x)', is_correct: true },
          { label: 'B', content: '1 / (1 + e^-x)', is_correct: false },
          { label: 'C', content: 'tanh(x)', is_correct: false },
          { label: 'D', content: 'x^2', is_correct: false },
        ],
      },
      {
        stem: 'What is backpropagation?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Algorithm to compute gradients in neural networks', is_correct: true },
          { label: 'B', content: 'Forward pass through network', is_correct: false },
          { label: 'C', content: 'Activation function', is_correct: false },
          { label: 'D', content: 'Data augmentation', is_correct: false },
        ],
      },
      {
        stem: 'What is a Convolutional Neural Network (CNN)?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Neural network for image processing', is_correct: true },
          { label: 'B', content: 'Neural network for text', is_correct: false },
          { label: 'C', content: 'Neural network for clustering', is_correct: false },
          { label: 'D', content: 'Linear model', is_correct: false },
        ],
      },
      {
        stem: 'What is a Recurrent Neural Network (RNN)?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Neural network for sequential data', is_correct: true },
          { label: 'B', content: 'Neural network for images', is_correct: false },
          { label: 'C', content: 'Feedforward network', is_correct: false },
          { label: 'D', content: 'Clustering network', is_correct: false },
        ],
      },
      {
        stem: 'What is LSTM?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Long Short-Term Memory, type of RNN', is_correct: true },
          { label: 'B', content: 'Convolutional layer type', is_correct: false },
          { label: 'C', content: 'Activation function', is_correct: false },
          { label: 'D', content: 'Optimization algorithm', is_correct: false },
        ],
      },
      {
        stem: 'What is dropout?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Regularization technique that randomly disables neurons', is_correct: true },
          { label: 'B', content: 'Activation function', is_correct: false },
          { label: 'C', content: 'Loss function', is_correct: false },
          { label: 'D', content: 'Data augmentation', is_correct: false },
        ],
      },
      {
        stem: 'What is batch normalization?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Normalizing layer inputs during training', is_correct: true },
          { label: 'B', content: 'Normalizing final outputs', is_correct: false },
          { label: 'C', content: 'Data preprocessing', is_correct: false },
          { label: 'D', content: 'Weight initialization', is_correct: false },
        ],
      },
      {
        stem: 'What is transfer learning?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Using pre-trained models for new tasks', is_correct: true },
          { label: 'B', content: 'Training from scratch', is_correct: false },
          { label: 'C', content: 'Data augmentation', is_correct: false },
          { label: 'D', content: 'Model compression', is_correct: false },
        ],
      },
      {
        stem: 'What is the vanishing gradient problem?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Gradients become too small in deep networks', is_correct: true },
          { label: 'B', content: 'Gradients become too large', is_correct: false },
          { label: 'C', content: 'Loss increases during training', is_correct: false },
          { label: 'D', content: 'Model overfits quickly', is_correct: false },
        ],
      },
      {
        stem: 'What is a GAN?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Generative Adversarial Network', is_correct: true },
          { label: 'B', content: 'Gradient Aggregation Network', is_correct: false },
          { label: 'C', content: 'General Activation Network', is_correct: false },
          { label: 'D', content: 'Grouped Analysis Network', is_correct: false },
        ],
      },
      {
        stem: 'What is Adam optimizer?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Adaptive moment estimation optimization algorithm', is_correct: true },
          { label: 'B', content: 'Activation function', is_correct: false },
          { label: 'C', content: 'Loss function', is_correct: false },
          { label: 'D', content: 'Regularization technique', is_correct: false },
        ],
      },
      {
        stem: 'What is the purpose of pooling layers in CNNs?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Reduce spatial dimensions', is_correct: true },
          { label: 'B', content: 'Increase resolution', is_correct: false },
          { label: 'C', content: 'Add non-linearity', is_correct: false },
          { label: 'D', content: 'Normalize data', is_correct: false },
        ],
      },
    ],
  },
  {
    mooc_id: 19,
    mooc_name: 'ML Projects',
    questions: [
      {
        stem: 'What is the first step in an ML project?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Define the problem and objectives', is_correct: true },
          { label: 'B', content: 'Choose an algorithm', is_correct: false },
          { label: 'C', content: 'Start training', is_correct: false },
          { label: 'D', content: 'Deploy the model', is_correct: false },
        ],
      },
      {
        stem: 'What is exploratory data analysis (EDA)?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Analyzing data to understand patterns', is_correct: true },
          { label: 'B', content: 'Training models', is_correct: false },
          { label: 'C', content: 'Deploying applications', is_correct: false },
          { label: 'D', content: 'Writing documentation', is_correct: false },
        ],
      },
      {
        stem: 'What is data cleaning?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Handling missing values and errors', is_correct: true },
          { label: 'B', content: 'Training models', is_correct: false },
          { label: 'C', content: 'Selecting features', is_correct: false },
          { label: 'D', content: 'Evaluating results', is_correct: false },
        ],
      },
      {
        stem: 'What is a baseline model?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Simple model to compare against', is_correct: true },
          { label: 'B', content: 'Most complex model', is_correct: false },
          { label: 'C', content: 'Production model', is_correct: false },
          { label: 'D', content: 'Final model', is_correct: false },
        ],
      },
      {
        stem: 'What is hyperparameter tuning?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Optimizing model configuration parameters', is_correct: true },
          { label: 'B', content: 'Training data preparation', is_correct: false },
          { label: 'C', content: 'Feature engineering', is_correct: false },
          { label: 'D', content: 'Model deployment', is_correct: false },
        ],
      },
      {
        stem: 'What is grid search?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Exhaustive search over hyperparameter space', is_correct: true },
          { label: 'B', content: 'Random hyperparameter selection', is_correct: false },
          { label: 'C', content: 'Feature selection method', is_correct: false },
          { label: 'D', content: 'Data cleaning technique', is_correct: false },
        ],
      },
      {
        stem: 'What is model deployment?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Making model available for production use', is_correct: true },
          { label: 'B', content: 'Training the model', is_correct: false },
          { label: 'C', content: 'Collecting data', is_correct: false },
          { label: 'D', content: 'Evaluating performance', is_correct: false },
        ],
      },
      {
        stem: 'What is A/B testing in ML?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Comparing two model versions in production', is_correct: true },
          { label: 'B', content: 'Training two models simultaneously', is_correct: false },
          { label: 'C', content: 'Using two datasets', is_correct: false },
          { label: 'D', content: 'Testing two features', is_correct: false },
        ],
      },
      {
        stem: 'What is model monitoring?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Tracking model performance in production', is_correct: true },
          { label: 'B', content: 'Training supervision', is_correct: false },
          { label: 'C', content: 'Data collection', is_correct: false },
          { label: 'D', content: 'Feature selection', is_correct: false },
        ],
      },
      {
        stem: 'What is model drift?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Degradation of model performance over time', is_correct: true },
          { label: 'B', content: 'Model improvement', is_correct: false },
          { label: 'C', content: 'Training instability', is_correct: false },
          { label: 'D', content: 'Data corruption', is_correct: false },
        ],
      },
      {
        stem: 'What is MLOps?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Practices for deploying and maintaining ML systems', is_correct: true },
          { label: 'B', content: 'Machine learning algorithms', is_correct: false },
          { label: 'C', content: 'Data preprocessing', is_correct: false },
          { label: 'D', content: 'Model training', is_correct: false },
        ],
      },
      {
        stem: 'What is feature importance?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Measure of how much features contribute to predictions', is_correct: true },
          { label: 'B', content: 'Number of features', is_correct: false },
          { label: 'C', content: 'Feature scaling method', is_correct: false },
          { label: 'D', content: 'Data quality metric', is_correct: false },
        ],
      },
      {
        stem: 'What is data augmentation?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Artificially expanding training data', is_correct: true },
          { label: 'B', content: 'Removing duplicate data', is_correct: false },
          { label: 'C', content: 'Compressing data', is_correct: false },
          { label: 'D', content: 'Normalizing data', is_correct: false },
        ],
      },
      {
        stem: 'What is reproducibility in ML?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Ability to recreate results consistently', is_correct: true },
          { label: 'B', content: 'Model accuracy', is_correct: false },
          { label: 'C', content: 'Training speed', is_correct: false },
          { label: 'D', content: 'Deployment efficiency', is_correct: false },
        ],
      },
      {
        stem: 'What is model interpretability?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Understanding how models make predictions', is_correct: true },
          { label: 'B', content: 'Model accuracy', is_correct: false },
          { label: 'C', content: 'Training speed', is_correct: false },
          { label: 'D', content: 'Model size', is_correct: false },
        ],
      },
    ],
  },
];

async function insertQuestions() {
  let pool;
  try {
    pool = await sql.connect(config);
    console.log('✅ Connected to database');

    let totalInserted = 0;

    for (const moocData of questionsData) {
      console.log(`\n📚 Processing MOOC ${moocData.mooc_id}: ${moocData.mooc_name}`);

      for (const q of moocData.questions) {
        const insertQuestionResult = await pool
          .request()
          .input('mooc_id', sql.Int, moocData.mooc_id)
          .input('stem', sql.NVarChar, q.stem)
          .input('qtype', sql.NVarChar, 'mcq')
          .input('difficulty', sql.NVarChar, q.difficulty)
          .input('max_score', sql.Decimal(5, 2), 1.0).query(`
            INSERT INTO questions (mooc_id, stem, qtype, difficulty, max_score)
            OUTPUT INSERTED.question_id
            VALUES (@mooc_id, @stem, @qtype, @difficulty, @max_score)
          `);

        const questionId = insertQuestionResult.recordset[0].question_id;

        for (const opt of q.options) {
          await pool
            .request()
            .input('question_id', sql.Int, questionId)
            .input('label', sql.NVarChar, opt.label)
            .input('content', sql.NVarChar, opt.content)
            .input('is_correct', sql.Bit, opt.is_correct).query(`
              INSERT INTO question_options (question_id, label, content, is_correct)
              VALUES (@question_id, @label, @content, @is_correct)
            `);
        }

        totalInserted++;
      }

      console.log(`✅ Completed MOOC ${moocData.mooc_id}: ${moocData.questions.length} questions`);
    }

    console.log(`\n🎉 Successfully inserted ${totalInserted} questions for Course 5: Machine Learning`);
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    if (pool) {
      await pool.close();
      console.log('Database connection closed');
    }
  }
}

insertQuestions();
