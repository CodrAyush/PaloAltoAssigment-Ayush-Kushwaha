// Skill synonyms map for fuzzy matching in fallback mode
export const skillSynonyms = {
  'javascript': ['js', 'ecmascript', 'es6', 'es2015', 'vanilla js'],
  'typescript': ['ts'],
  'react': ['reactjs', 'react.js', 'react js'],
  'node.js': ['nodejs', 'node', 'node js'],
  'express': ['expressjs', 'express.js'],
  'next.js': ['nextjs', 'next'],
  'vue': ['vuejs', 'vue.js'],
  'angular': ['angularjs', 'angular.js'],
  'python': ['py', 'python3'],
  'java': ['jdk', 'jre'],
  'html': ['html5', 'html/css'],
  'css': ['css3', 'cascading style sheets', 'html/css'],
  'sql': ['structured query language', 'mysql', 'postgresql', 'postgres'],
  'postgresql': ['postgres', 'psql'],
  'mongodb': ['mongo'],
  'rest apis': ['restful', 'rest api', 'restful apis', 'api development', 'web apis'],
  'graphql': ['gql'],
  'docker': ['containerization', 'containers'],
  'kubernetes': ['k8s', 'kube'],
  'aws': ['amazon web services', 'amazon aws'],
  'azure': ['microsoft azure', 'ms azure'],
  'gcp': ['google cloud', 'google cloud platform'],
  'terraform': ['tf', 'infrastructure as code', 'iac'],
  'ci/cd': ['continuous integration', 'continuous deployment', 'continuous delivery', 'cicd'],
  'git': ['github', 'gitlab', 'version control', 'bitbucket'],
  'linux': ['unix', 'ubuntu', 'centos', 'debian'],
  'bash': ['shell', 'shell scripting', 'zsh'],
  'machine learning': ['ml', 'machine-learning'],
  'deep learning': ['dl', 'deep-learning', 'neural networks'],
  'tensorflow': ['tf', 'tensor flow'],
  'pytorch': ['torch'],
  'nlp': ['natural language processing'],
  'computer vision': ['cv', 'image recognition'],
  'data visualization': ['data viz', 'visualization', 'charts', 'dashboards'],
  'agile': ['scrum', 'kanban', 'sprint'],
  'testing': ['unit testing', 'integration testing', 'test driven development', 'tdd', 'jest', 'mocha'],
  'responsive design': ['responsive', 'mobile-first', 'rwd'],
  'microservices': ['micro services', 'micro-services'],
  'networking': ['tcp/ip', 'dns', 'http', 'network protocols'],
  'monitoring': ['observability', 'prometheus', 'grafana', 'datadog'],
  'redis': ['caching', 'in-memory database'],
  'kafka': ['event streaming', 'message queue'],
  'spark': ['apache spark', 'pyspark'],
  'pandas': ['dataframe', 'data analysis'],
  'numpy': ['numerical python', 'scientific computing'],
  'scikit-learn': ['sklearn', 'scikit learn'],
  'statistics': ['statistical analysis', 'probability', 'hypothesis testing'],
  'figma': ['ui design tool'],
  'user research': ['ux research', 'usability research'],
  'network security': ['cybersecurity', 'information security', 'infosec'],
  'penetration testing': ['pen testing', 'ethical hacking'],
  'incident response': ['ir', 'security incident handling'],
  'product strategy': ['product management', 'product roadmap'],
};

// Normalize and match skills
export function normalizeSkill(skill) {
  return skill.toLowerCase().trim();
}

export function findMatchingSkill(userSkill, targetSkills) {
  const normalized = normalizeSkill(userSkill);

  for (const target of targetSkills) {
    const normalizedTarget = normalizeSkill(target);

    // Direct match
    if (normalized === normalizedTarget) return target;

    // Check if user skill is a synonym of target
    const targetSynonyms = skillSynonyms[normalizedTarget] || [];
    if (targetSynonyms.includes(normalized)) return target;

    // Check if target is a synonym of user skill
    const userSynonyms = skillSynonyms[normalized] || [];
    if (userSynonyms.includes(normalizedTarget)) return target;

    // Partial match (e.g., "React.js" matches "React")
    if (normalized.includes(normalizedTarget) || normalizedTarget.includes(normalized)) {
      return target;
    }
  }

  return null;
}
