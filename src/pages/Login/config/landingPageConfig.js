export const landingPageConfig = {
  // Brand Configuration
  brand: {
    logo: null,
    name: 'Digital Committees Platform',
    tagline: 'Empowering Committee Management',
  },

  // Hero Section
  hero: {
    enabled: true,
    title: 'Welcome to Digital Committees Platform',
    subtitle: 'Manage meetings, decisions, members, and governance effortlessly with a modern digital platform.',
    description:
      'Organize committees, schedule meetings, track decisions, manage tasks, and enhance collaboration, all from one unified and intelligent system.',
    backgroundImages: null,
    ctaText: 'Sign In',
    showAnimation: true,
    autoPlay: true,
    autoPlayInterval: 5000, // 5 seconds
  },

  // About Organization Section
  about: {
    enabled: true,
    title: 'About Health Holding Company',
    description:
      'The Health Holding Company is a national state-owned company that provides comprehensive and integrated healthcare services through the health clusters that serve the Kingdom of Saudi Arabia.',
    image: null,
  },

  // Mission & Vision Section
  missionVision: {
    enabled: true,
    mission: {
      title: 'Our Mission',
      description: 'Deliver an innovative and sustainable model of care for better quality of life, for all',
      icon: 'Target',
      gradient: 'from-blue-500 to-cyan-500',
    },
    vision: {
      title: 'Our Vision',
      description: 'Advancing care to elevate health and wellbeing for all',
      icon: 'Eye',
      gradient: 'from-purple-500 to-pink-500',
    },
  },

  // Strategy Overview Section (Promises, Values, Objectives)
  strategyOverview: {
    enabled: true,
    title: 'Our Strategy Framework',
    subtitle: 'Built on core principles that guide our strategic direction',
    items: [
      {
        type: 'promises',
        count: 4,
        label: 'Promises',
        icon: 'Handshake',
        description: 'Our commitments to excellence',
        gradient: 'from-blue-500 to-indigo-600',
        bgGradient: 'bg-gradient-to-br from-blue-400 to-blue-600',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        items: [
          {
            title: 'To Our Beneficiaries',
            description: 'Make your health our priority',
            icon: 'Users',
          },
          {
            title: 'To Our Government',
            description: 'Ensure sustainable quality healthcare',
            icon: 'Building2',
          },
          {
            title: 'To Our Employees',
            description: 'Be an employer of choice',
            icon: 'Briefcase',
          },
          {
            title: 'To Our Nation',
            description: 'Put Saudi on the global healthcare map',
            icon: 'Globe',
          },
        ],
      },
      {
        type: 'values',
        count: 5,
        label: 'Values',
        icon: 'Heart',
        description: 'The principles we stand by',
        gradient: 'from-green-500 to-emerald-600',
        bgGradient: 'bg-gradient-to-br from-green-600 to-green-800',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        items: [
          {
            title: 'Deliver with compassion',
            description: 'Caring for every individual with empathy and understanding',
            icon: 'Heart',
          },
          {
            title: 'Passion for excellence',
            description: 'Striving for the highest standards in everything we do',
            icon: 'Award',
          },
          {
            title: 'Lead with innovation',
            description: 'Embracing new ideas and technologies to drive progress',
            icon: 'Lightbulb',
          },
          {
            title: 'Empower with trust',
            description: 'Building confidence through transparency and accountability',
            icon: 'Shield',
          },
          {
            title: 'Act as one',
            description: 'Working together collaboratively towards common goals',
            icon: 'Users',
          },
        ],
      },
      {
        type: 'objectives',
        count: 6,
        label: 'Objectives',
        icon: 'Target',
        description: 'Our key focus areas',
        gradient: 'from-purple-500 to-violet-600',
        bgGradient: 'bg-gradient-to-br from-purple-400 to-purple-600',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        items: [
          {
            title: 'Objective 1',
            description: "Proactively manage the population's health through engagement & stakeholder collaboration",
            icon: 'Target',
          },
          {
            title: 'Objective 2',
            description: 'Invest in developing a skilled & engaged workforce in an attractive working environment',
            icon: 'GraduationCap',
          },
          {
            title: 'Objective 3',
            description: 'Achieve sustainable operational and capital structures',
            icon: 'TrendingUp',
          },
          {
            title: 'Objective 4',
            description: 'Implement a patient-centric & innovative model of care alongside globally recognized standards',
            icon: 'UserCheck',
          },
          {
            title: 'Objective 5',
            description: 'Deploy an advanced digital ecosystem to manage real-time information and enhance decision-making',
            icon: 'Database',
          },
          {
            title: 'Objective 6',
            description: 'Build an effective ecosystem through robust governance and risk management',
            icon: 'Shield',
          },
        ],
      },
    ],
  },

  // System Capabilities Section (Strategy Management focused)
  capabilities: {
    enabled: true,
    title: 'Committee Management Capabilities',
    subtitle: 'A unified platform to streamline meetings, decisions, and governance processes',
    items: [
      {
        icon: 'Users',
        title: 'Committee & Member Management',
        description: 'Create committees, assign roles, manage members, and control access with flexible governance tools.',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        gradient: 'from-blue-500 to-cyan-500',
      },
      {
        icon: 'Calendar',
        title: 'Meetings & Agenda Planning',
        description: 'Schedule physical or virtual meetings, organize agenda items, and track attendance with ease.',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        gradient: 'from-green-500 to-emerald-500',
      },
      {
        icon: 'FileCheck',
        title: 'Minutes of Meeting (MoM)',
        description: 'Document meetings with a rich MoM editor, attach files, and publish official records seamlessly.',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        gradient: 'from-purple-500 to-pink-500',
      },
      {
        icon: 'Vote',
        title: 'Voting & Decision Management',
        description: 'Create votes, track results, manage decisions, and ensure accountability with transparent workflows.',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        gradient: 'from-orange-500 to-red-500',
      },
      {
        icon: 'CheckSquare',
        title: 'Tasks & Action Items',
        description: 'Assign tasks from meetings or decisions, track progress, and monitor execution across committees.',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        gradient: 'from-red-500 to-rose-500',
      },
      {
        icon: 'Folder',
        title: 'Documents & Attachments',
        description: 'Centralize all committee documents with secure storage, easy search, and categorized access.',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        gradient: 'from-indigo-500 to-blue-500',
      },
    ],
  },
};
