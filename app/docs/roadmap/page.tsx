import { Metadata } from 'next';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateMetadata } from '@/config/meta.config';
import { cn } from '@/lib/utils';

export const metadata: Metadata = await generateMetadata({
  title: 'Roadmap - Nextjs v15 Boilerplate',
  description: 'Explore our project roadmap and upcoming features.',
});

interface RoadmapItem {
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed';
  quarter: string;
}

const roadmapItems: RoadmapItem[] = [
  // Authentication & Authorization
  {
    title: 'Role-based Access Control (RBAC)',
    description: 'Implement comprehensive role-based access control system.',
    status: 'in-progress',
    quarter: 'Q2 2024',
  },
  {
    title: 'Social Authentication',
    description:
      'Add social authentication providers (Google, GitHub, etc.) and passwordless authentication option.',
    status: 'completed',
    quarter: 'Q1 2024',
  },
  {
    title: 'Enhanced Authentication',
    description:
      'Implement session management, refresh token logic, and 2FA support.',
    status: 'in-progress',
    quarter: 'Q2 2024',
  },
  // Database & Data Management
  {
    title: 'Database Utilities',
    description:
      'Implement database seeding utilities, backup/restore procedures, and reusable patterns.',
    status: 'in-progress',
    quarter: 'Q2 2024',
  },
  {
    title: 'Data Validation',
    description:
      'Add data validation middleware and implement soft delete patterns.',
    status: 'planned',
    quarter: 'Q2 2024',
  },
  // API & Integration
  {
    title: 'API Enhancements',
    description:
      'Implement API versioning, WebSocket support, and API caching best practices.',
    status: 'planned',
    quarter: 'Q3 2024',
  },
  // UI/UX Components
  {
    title: 'Dark Mode Support',
    description:
      'Implement comprehensive dark mode theming across all components.',
    status: 'completed',
    quarter: 'Q1 2024',
  },
  {
    title: 'Enhanced UI Components',
    description:
      'Implement toast notifications system and infinite scroll components.',
    status: 'in-progress',
    quarter: 'Q2 2024',
  },
  {
    title: 'Skeleton Loading',
    description: 'Implement skeleton loading states across all components.',
    status: 'completed',
    quarter: 'Q1 2024',
  },
  // Forms & Validation
  {
    title: 'Form Components',
    description:
      'Create reusable form components with validation patterns and file upload support.',
    status: 'in-progress',
    quarter: 'Q2 2024',
  },
  {
    title: 'Dynamic Form Builder',
    description:
      'Create a dynamic form builder with customizable fields and validation.',
    status: 'planned',
    quarter: 'Q3 2024',
  },
  // State Management
  {
    title: 'State Management Patterns',
    description:
      'Implement global state management, storage utilities, and state persistence.',
    status: 'planned',
    quarter: 'Q3 2024',
  },
  // SEO & Analytics
  {
    title: 'SEO Tools',
    description: 'Add SEO optimization utilities and structured data helpers.',
    status: 'planned',
    quarter: 'Q3 2024',
  },
  {
    title: 'Sitemap Generation',
    description: 'Implement automatic sitemap generation for all routes.',
    status: 'completed',
    quarter: 'Q1 2024',
  },
  // Caching & Performance
  {
    title: 'Redis Integration',
    description:
      'Add Redis caching layer for improved performance - implement for invites, all forms, etc..',
    status: 'planned',
    quarter: 'Q3 2024',
  },
  {
    title: 'Image Optimization',
    description:
      'Create Blur image optimization utilities and implement code splitting strategies.',
    status: 'planned',
    quarter: 'Q3 2024',
  },
  // Testing
  {
    title: 'Testing Infrastructure',
    description:
      'Add unit, integration, and end-to-end testing setup with testing utilities.',
    status: 'planned',
    quarter: 'Q3 2024',
  },
  {
    title: 'Performance Testing',
    description: 'Add performance testing tools and monitoring.',
    status: 'planned',
    quarter: 'Q4 2024',
  },
  // Documentation
  {
    title: 'API Documentation',
    description:
      'Comprehensive API documentation with better-auth integration.',
    status: 'completed',
    quarter: 'Q1 2024',
  },
  {
    title: 'Component Documentation',
    description:
      'Create comprehensive component documentation with usage examples.',
    status: 'in-progress',
    quarter: 'Q2 2024',
  },
  {
    title: 'Deployment Guides',
    description:
      'Create detailed deployment guides and contribution guidelines.',
    status: 'planned',
    quarter: 'Q3 2024',
  },
  // Error System
  {
    title: 'Error System Consolidation',
    description:
      'Standardize error handling, implement factory functions, and add documentation.',
    status: 'in-progress',
    quarter: 'Q2 2024',
  },
  {
    title: 'Error System Enhancements',
    description:
      'Add error metadata, correlation, monitoring, and analytics dashboard.',
    status: 'in-progress',
    quarter: 'Q3 2024',
  },
  // Logging System
  {
    title: 'Base Logging Implementation',
    description:
      'Console and database logging with batched writing and auto-flush.',
    status: 'completed',
    quarter: 'Q1 2024',
  },
  {
    title: 'Advanced Logging Features',
    description:
      'Implement selective route logging, request body logging, and advanced sampling.',
    status: 'planned',
    quarter: 'Q3 2024',
  },
  // Security
  {
    title: 'Security Features',
    description:
      'Implement CSRF protection, security headers, and XSS prevention utilities.',
    status: 'in-progress',
    quarter: 'Q2 2024',
  },
  {
    title: 'Compliance',
    description:
      'Add GDPR compliance utilities and implement accessibility standards.',
    status: 'planned',
    quarter: 'Q3 2024',
  },
  {
    title: 'Audit Logging',
    description:
      'Enhanced audit logging with advanced filtering, sorting, and export functionality.',
    status: 'in-progress',
    quarter: 'Q2 2024',
  },
  // Internationalization
  {
    title: 'i18n Support',
    description:
      'Add multi-language support, RTL support, and translation management system.',
    status: 'planned',
    quarter: 'Q4 2024',
  },
  // Enterprise Features
  {
    title: 'Enterprise Features',
    description:
      'Add multi-tenant support, compliance features, and advanced analytics.',
    status: 'planned',
    quarter: 'Q1 2025',
  },
  // Community & Ecosystem
  {
    title: 'Plugin System',
    description: 'Create plugin system with marketplace features.',
    status: 'planned',
    quarter: 'Q1 2025',
  },
  {
    title: 'Theme System',
    description: 'Add theme customization and template system.',
    status: 'planned',
    quarter: 'Q4 2024',
  },
  {
    title: 'Accessibility Audit Tools',
    description:
      'Implement tools for automated accessibility auditing and compliance reporting.',
    status: 'planned',
    quarter: 'Q4 2024',
  },
  // Error Handling
  {
    title: 'Enhanced Error Handling',
    description:
      'Implement comprehensive error handling patterns across the application with improved user feedback.',
    status: 'in-progress',
    quarter: 'Q2 2024',
  },
  {
    title: 'Error Monitoring System',
    description:
      'Add centralized error logging and monitoring with real-time alerts and analytics.',
    status: 'planned',
    quarter: 'Q3 2024',
  },
  // DevOps & Deployment
  {
    title: 'CI/CD Pipeline Enhancements',
    description:
      'Improve CI/CD workflows with automated testing, deployment, and rollback capabilities.',
    status: 'planned',
    quarter: 'Q4 2024',
  },
  {
    title: 'Docker Containerization',
    description:
      'Provide Docker configuration for development and production environments.',
    status: 'in-progress',
    quarter: 'Q2 2024',
  },
];

const statusColors = {
  completed: 'bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300',
  'in-progress': 'bg-sky-100 dark:bg-sky-950/50 dark:text-sky-300',
  planned: 'bg-slate-100 dark:bg-slate-950/50 dark:text-slate-300',
} as const;

function StatusBadge({ status }: { status: RoadmapItem['status'] }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'font-medium capitalize text-slate-700 hover:bg-opacity-80',
        statusColors[status]
      )}
    >
      {status.replace('-', ' ')}
    </Badge>
  );
}

export default function RoadmapPage() {
  const quarters = Array.from(
    new Set(roadmapItems.map((item) => item.quarter))
  ).sort();
  const statuses: RoadmapItem['status'][] = [
    'in-progress',
    'planned',
    'completed',
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Project Roadmap</h1>
        <p className="text-lg text-muted-foreground">
          Explore our planned features and improvements for the Nextjs v15
          Boilerplate.
        </p>

        {/* Status Summary */}
        <div className="mt-6 flex gap-4">
          {statuses.map((status) => (
            <div key={status} className="flex items-center gap-2">
              <span
                className={cn('h-3 w-3 rounded-full', statusColors[status])}
              />
              <span className="text-sm capitalize text-muted-foreground">
                {status.replace('-', ' ')}:{' '}
                {roadmapItems.filter((item) => item.status === status).length}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="timeline" className="mb-8">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="quarters">By Quarter</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-6">
          <ScrollArea className="h-[700px] pr-4">
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-muted-foreground/20 before:to-transparent">
              {roadmapItems.map((item, index) => (
                <Card
                  key={index}
                  className="relative ml-10 flex flex-col gap-2 p-6"
                >
                  <div className="absolute -left-[3.25rem] top-6 flex h-10 w-10 items-center justify-center rounded-full border bg-background">
                    <span
                      className={cn(
                        'h-3 w-3 rounded-full',
                        statusColors[item.status]
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{item.title}</h3>
                      <StatusBadge status={item.status} />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {item.quarter}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{item.description}</p>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="quarters" className="mt-6">
          <ScrollArea className="h-[700px] pr-4">
            <div className="grid gap-8">
              {quarters.map((quarter) => (
                <div key={quarter}>
                  <h2 className="mb-4 text-xl font-semibold">{quarter}</h2>
                  <div className="grid gap-4">
                    {roadmapItems
                      .filter((item) => item.quarter === quarter)
                      .map((item, index) => (
                        <Card key={index} className="flex flex-col gap-2 p-6">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{item.title}</h3>
                              <StatusBadge status={item.status} />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {item.quarter}
                            </span>
                          </div>
                          <p className="text-muted-foreground">
                            {item.description}
                          </p>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
