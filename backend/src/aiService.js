async function analyzeEmail(email) {
  
  return {
    summary: email.body.slice(0, 100), 
    sentiment: 'neutral'
  };
}

module.exports = { analyzeEmail };
