export interface Resource {
  id: string
  title: string
  description: string
  category: 'academic' | 'transport' | 'special'
  icon: string
  url: string
  tags: string[]
  featured?: boolean
}

// Academic Resources - Easy to extend
export const academicResources: Resource[] = [
  {
    id: 'finance-resources',
    title: 'Public & Private Markets Finance Resources',
    description: 'Comprehensive collection of finance materials, case studies, and preparation guides for HEC students.',
    category: 'academic',
    icon: 'BookOpen',
    url: 'https://hecparis-my.sharepoint.com/personal/tom_hommola_hec_edu/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Ftom%5Fhommola%5Fhec%5Fedu%2FDocuments%2FApplication%20Prep%2025%2D26%20Cohort&ga=1',
    tags: ['Finance', 'Case Studies', 'Preparation'],
    featured: true
  },
  {
    id: 'case-study-guide',
    title: 'Case Study Preparation Guide',
    description: 'Essential tips and frameworks for mastering case study interviews.',
    category: 'academic',
    icon: 'BookOpen',
    url: '#',
    tags: ['Case Studies', 'Interviews', 'Frameworks']
  },
  {
    id: 'consulting-resources',
    title: 'Consulting Resources Hub',
    description: 'Curated resources for consulting career preparation and interview practice.',
    category: 'academic',
    icon: 'BookOpen',
    url: '#',
    tags: ['Consulting', 'Career', 'Interviews']
  }
]

// Transport Resources
export const transportResources: Resource[] = [
  {
    id: 'cabpooling',
    title: 'HEC CDG Cabpooling System Platform',
    description: 'Find ride-sharing partners for airport transfers. Match with students arriving within 1.5 hours of your arrival time.',
    category: 'transport',
    icon: 'Car',
    url: 'https://cdg-hec-cabpooler-gg.netlify.app/',
    tags: ['Transport', 'Airport', 'Cost Sharing'],
    featured: true
  },
  {
    id: 'cabpooling',
    title: 'HEC CDG Cabpooling System Data',
    description: 'Fill in the sheet to enter data for the cabpooling system',
    category: 'transport',
    icon: 'Car',
    url: 'https://docs.google.com/spreadsheets/d/15AX8HDyYRu1w-Gi2FgzeSX_EmibsHREYuZXhZCVxpyk/edit?gid=0#gid=0',
    tags: ['Transport', 'Airport', 'Cost Sharing'],
    featured: true
  }
]

// Special Features
export const specialFeatures: Resource[] = [
  {
    id: 'study-groups',
    title: 'Study Group Finder',
    description: 'Connect with students studying similar topics or preparing for the same interviews.',
    category: 'special',
    icon: 'Users',
    url: '/sessions/match',
    tags: ['Study Groups', 'Collaboration']
  }
]

// Helper function to add new resources
export const addResource = (
  resources: Resource[],
  newResource: Resource
): Resource[] => {
  return [...resources, newResource]
}

// Helper function to add new academic resource
export const addAcademicResource = (newResource: Omit<Resource, 'category'>): void => {
  academicResources.push({
    ...newResource,
    category: 'academic'
  })
}

// Helper function to add new transport resource
export const addTransportResource = (newResource: Omit<Resource, 'category'>): void => {
  transportResources.push({
    ...newResource,
    category: 'transport'
  })
}

// Helper function to add new special feature
export const addSpecialFeature = (newResource: Omit<Resource, 'category'>): void => {
  specialFeatures.push({
    ...newResource,
    category: 'special'
  })
}

// Get all resources
export const getAllResources = (): Resource[] => {
  return [...academicResources, ...transportResources, ...specialFeatures]
}

// Get featured resources
export const getFeaturedResources = (): Resource[] => {
  return getAllResources().filter(resource => resource.featured)
}

// Get resources by category
export const getResourcesByCategory = (category: Resource['category']): Resource[] => {
  return getAllResources().filter(resource => resource.category === category)
}

// Example of how to add new resources (copy and paste these snippets):

/*
// Add new academic resource
addAcademicResource({
  id: 'new-resource-id',
  title: 'New Resource Title',
  description: 'Description of the new resource',
  icon: 'BookOpen', // or 'Car', 'Users', etc.
  url: 'https://example.com',
  tags: ['Tag1', 'Tag2'],
  featured: false // set to true to feature it
})

// Add new transport resource
addTransportResource({
  id: 'new-transport-id',
  title: 'New Transport Service',
  description: 'Description of transport service',
  icon: 'Car',
  url: 'https://transport-service.com',
  tags: ['Transport', 'Service'],
  featured: false
})

// Add new special feature
addSpecialFeature({
  id: 'new-feature-id',
  title: 'New Special Feature',
  description: 'Description of special feature',
  icon: 'Users',
  url: '/internal-route',
  tags: ['Feature', 'Special'],
  featured: false
})
*/
