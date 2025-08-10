# Resources & Specials - Extension Guide

This guide shows you how to easily add new resources to the HEC Session Manager application.

## 🚀 Quick Start

To add a new resource, simply copy and paste one of the code snippets below into the `src/lib/resourcesConfig.ts` file.

## 📚 Adding Academic Resources

```typescript
// Add new academic resource
addAcademicResource({
  id: 'your-resource-id',
  title: 'Your Resource Title',
  description: 'Description of your academic resource',
  icon: 'BookOpen', // Available icons: 'BookOpen', 'Car', 'Users'
  url: 'https://your-resource-url.com',
  tags: ['Tag1', 'Tag2', 'Tag3'],
  featured: false // Set to true to feature it prominently
})
```

### Example:
```typescript
addAcademicResource({
  id: 'mba-prep-guide',
  title: 'MBA Preparation Guide',
  description: 'Comprehensive guide for MBA application preparation and interview tips.',
  icon: 'BookOpen',
  url: 'https://example.com/mba-guide',
  tags: ['MBA', 'Applications', 'Interviews'],
  featured: true
})
```

## 🚗 Adding Transport Resources

```typescript
// Add new transport resource
addTransportResource({
  id: 'your-transport-id',
  title: 'Your Transport Service',
  description: 'Description of your transport service',
  icon: 'Car',
  url: 'https://your-transport-service.com',
  tags: ['Transport', 'Service'],
  featured: false
})
```

### Example:
```typescript
addTransportResource({
  id: 'shuttle-service',
  title: 'HEC Shuttle Service',
  description: 'Regular shuttle service between HEC campus and major transport hubs.',
  icon: 'Car',
  url: 'https://hec-shuttle.com',
  tags: ['Shuttle', 'Campus', 'Regular'],
  featured: false
})
```

## ⭐ Adding Special Features

```typescript
// Add new special feature
addSpecialFeature({
  id: 'your-feature-id',
  title: 'Your Special Feature',
  description: 'Description of your special feature',
  icon: 'Users', // or 'BookOpen', 'Car'
  url: '/internal-route', // For internal pages
  tags: ['Feature', 'Special'],
  featured: false
})
```

### Example:
```typescript
addSpecialFeature({
  id: 'mentorship-program',
  title: 'Mentorship Program',
  description: 'Connect with alumni and industry professionals for career guidance.',
  icon: 'Users',
  url: '/mentorship',
  tags: ['Mentorship', 'Career', 'Alumni'],
  featured: true
})
```

## 🎯 Available Icons

- `'BookOpen'` - For academic resources, books, guides
- `'Car'` - For transport services, travel
- `'Users'` - For community features, groups, networking

## 📋 Resource Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| `id` | string | Unique identifier for the resource | ✅ |
| `title` | string | Display name of the resource | ✅ |
| `description` | string | Brief description of the resource | ✅ |
| `icon` | string | Icon to display (BookOpen/Car/Users) | ✅ |
| `url` | string | Link to the resource | ✅ |
| `tags` | string[] | Array of tags for categorization | ✅ |
| `featured` | boolean | Whether to feature prominently | ❌ |

## 🔗 URL Types

- **External URLs**: `'https://example.com'` - Opens in new tab
- **Internal Routes**: `'/internal-page'` - Navigates within the app
- **Placeholder**: `'#'` - For resources not yet available

## 🏷️ Tag Guidelines

- Use 2-4 tags per resource
- Keep tags short and descriptive
- Use consistent capitalization
- Common tags: `'Finance'`, `'Case Studies'`, `'Transport'`, `'Career'`, `'Interviews'`

## ⭐ Featured Resources

Set `featured: true` to:
- Display the resource prominently at the top
- Show it in the "Featured Resources" section
- Give it larger card styling

## 📝 Best Practices

1. **Descriptive IDs**: Use kebab-case for IDs (e.g., `'finance-case-studies'`)
2. **Clear Titles**: Make titles descriptive and action-oriented
3. **Concise Descriptions**: Keep descriptions under 100 characters
4. **Relevant Tags**: Use tags that help users find the resource
5. **Valid URLs**: Ensure all URLs are accessible and working

## 🔄 Adding Multiple Resources

You can add multiple resources at once:

```typescript
// Add multiple academic resources
addAcademicResource({
  id: 'resource-1',
  title: 'First Resource',
  description: 'Description 1',
  icon: 'BookOpen',
  url: 'https://example1.com',
  tags: ['Tag1', 'Tag2']
})

addAcademicResource({
  id: 'resource-2',
  title: 'Second Resource',
  description: 'Description 2',
  icon: 'BookOpen',
  url: 'https://example2.com',
  tags: ['Tag3', 'Tag4'],
  featured: true
})
```

## 🎨 Customization

The resources system is designed to be easily extensible. You can:

- Add new categories by extending the `Resource` interface
- Create new helper functions for specific resource types
- Customize the display logic in the resources page
- Add filtering and search capabilities

## 📞 Support

For questions about adding resources or customizing the system, refer to the main documentation or contact the development team.

---

**🌐 Live Application:** [https://find-ur-consult-buddy-hec.netlify.app/](https://find-ur-consult-buddy-hec.netlify.app/)
