// Debug: Test actual exam workflow 
// Copy this to browser console to test complete exam flow

async function testExamFlow() {
  console.log('🧪 TESTING COMPLETE EXAM FLOW');
    
  // Step 1: Check current page
  console.log('📍 Current URL:', window.location.href);
    
  // Step 2: Check localStorage token
  const token = localStorage.getItem('authToken');
  console.log('🔑 Auth Token:', token ? 'EXISTS' : 'MISSING');
    
  // Step 3: Find Take Exam buttons
  const examButtons = document.querySelectorAll('button');
  const takeExamButtons = Array.from(examButtons).filter(btn => 
    btn.textContent.includes('Take Exam') || btn.textContent.includes('No Questions')
  );
  console.log('🎯 Found buttons:', takeExamButtons.map(btn => btn.textContent));
    
  // Step 4: Try clicking if available
  const enabledTakeExam = takeExamButtons.find(btn => 
    btn.textContent.includes('Take Exam') && !btn.disabled
  );
    
  if (enabledTakeExam) {
    console.log('✅ Found enabled Take Exam button!');
    console.log('🖱️ Click to test...');
    // enabledTakeExam.click(); // Uncomment to auto-click
  } else {
    console.log('❌ No enabled Take Exam button found');
    console.log('🔍 Available buttons:', takeExamButtons.map(btn => ({
      text: btn.textContent,
      disabled: btn.disabled,
      classes: btn.className
    })));
  }
    
  // Step 5: Check network requests
  console.log('📡 To monitor API calls:');
  console.log('- Open Network tab');
  console.log("- Filter: 'exam'");
  console.log('- Click Take Exam button');
}

// Auto run
testExamFlow();