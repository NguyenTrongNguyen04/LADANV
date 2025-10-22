/**
 * @copyright 2024 NguyenTrongNguyen
 * @license Apache-2.0
 */

/**
 * Types
 */
import { MenuItem } from '@/types';

/**
 * Assets
 */
import {
  Blocks,
  Terminal,
  Package,
  SquareMousePointer,
  ChartPie,
  Files,
  UserRoundPen,
  GitFork,
  LaptopMinimal,
  ArrowBigDownDash,
  CreditCard,
  Twitter,
  Github,
  Linkedin,
  Instagram,
  Youtube,
  ScanLine,
  UserCheck,
  AlertTriangle,
  BookOpen,
  Database,
  Heart,
} from 'lucide-react';

import {
  feature1,
  feature01,
  feature2,
  feature02,
  blog1,
  blog2,
  blog3,
  avatar1,
  avatar2,
  avatar3,
} from '@/assets';

// Header
export const navMenu: MenuItem[] = [
  {
    href: '/solutions',
    label: 'Solutions',
    submenu: [
      {
        href: '#',
        icon: <ScanLine />,
        label: 'AI Ingredient Scan',
        desc: 'Instant analysis of labels and barcodes for ingredient function, risk, and personalized suitability.',
      },
      {
        href: '#',
        icon: <UserCheck />,
        label: 'Holistic Profile Builder',
        desc: 'Powerful tool to build your complete Skin + Health + Lifestyle profile for optimal recommendations.',
      },
      {
        href: '#',
        icon: <AlertTriangle />,
        label: 'Smart Allergy & Risk Alerts',
        desc: 'Automated warnings for ingredients you should avoid (pregnancy, allergies, known irritants).',
      },
      {
        href: '#',
        icon: <BookOpen />,
        label: 'Personalized Skincare Journal',
        desc: 'Log your routine, track skin reactions, and receive feedback for continuous routine refinement.',
      },
      {
        href: '#',
        icon: <Database />,
        label: 'Local Ingredient Database',
        desc: 'Advanced lookup of thousands of ingredients, localized and refined for the Vietnamese consumer.',
      },
      {
        href: '#',
        icon: <Heart />,
        label: 'Wellness & Lifestyle Suggestions',
        desc: 'Personalized recommendations for supplements, nutrition, and healthy habits based on your profile.',
      },
    ],
  },
  {
    href: '/features',
    label: 'Features',
  },
  {
    href: '/docs',
    label: 'Docs',
    submenu: [
      {
        href: '#',
        icon: <Terminal />,
        label: 'Getting Started',
        desc: 'Powerful options to securely authenticate and manage',
      },
      {
        href: '#',
        icon: <Package />,
        label: 'Core Concepts',
        desc: 'Add-on features built specifically for B2B applications',
      },
      {
        href: '#',
        icon: <SquareMousePointer />,
        label: 'Customization',
        desc: 'Embeddable prebuilt UI components for quick and seamless integrations',
      },
      {
        href: '#',
        icon: <Blocks />,
        label: 'Official Plugins',
        desc: 'The fastest and most seamless authentication solution for Next.js',
      },
    ],
  },
  {
    href: '/pricing',
    label: 'Pricing',
  },
];

// Hero
export const heroData = {
  sectionSubtitle: 'INGREDIENT TRUTH, SHOPPING CONFIDENCE',
  sectionTitle: 'Confusion to Clarity, meet',
  decoTitle: 'LADANV',
  sectionText:
    'LADANV uses AI and localized data to give you transparent ingredient analysis, personalized recommendations, and a confident choice—data, not hype.',
};

// Feature
export const featureData = {
  sectionSubtitle: 'Core Features',
  sectionTitle: 'Discover Powerful Features',
  sectionText:
    'LADANV is more than a tool. It\'s how you redefine self-care with AI, localized data, and deep, personal insights.',
  features: [
    {
      icon: <ChartPie size={32} />,
      iconBoxColor: 'bg-blue-600',
      title: 'Multi-Dimensional Analysis',
      desc: 'Never be confused by labels again. Scan or input ingredients and our AI breaks down the function, risk, and sourcing of every component in plain language.',
      imgSrc: feature01,
    },
    {
      icon: <Files size={32} />,
      iconBoxColor: 'bg-cyan-500',
      title: 'Holistic Personalization Profile',
      desc: 'Build a comprehensive map of your skin, allergy history, lifestyle, and health needs. LADANV recommends everything from skincare to nutrition, tailored only to you.',
      imgSrc: feature02,
    },
    {
      icon: <UserRoundPen size={32} />,
      iconBoxColor: 'bg-yellow-500',
      title: 'Smart Health Alerts',
      desc: 'Pregnant? Taking specific medication? LADANV automatically scans and issues instant alerts when products contain ingredients you should avoid.',
    },
    {
      icon: <GitFork size={32} />,
      iconBoxColor: 'bg-red-500',
      title: 'Continuous Progress Tracking',
      desc: 'Log your routines to see which products are truly effective and which cause irritation. Get AI feedback to continuously refine your habits.',
    },
    {
      icon: <Blocks size={32} />,
      iconBoxColor: 'bg-purple-500',
      title: 'Trusted Wellness Ecosystem',
      desc: 'Join our community for clean, ad-free information exchange. Connect LADANV to your wellness data for holistic recommendations.',
    },
  ],
};

// Process
export const processData = {
  sectionSubtitle: 'How it works',
  sectionTitle: '3 Simple Steps to Know Your Skin',
  sectionText:
    'LADANV connects AI, ingredient data, and your personal profile to create science-backed, transparent advice.',
  list: [
    {
      icon: <LaptopMinimal size={32} />,
      title: 'Build Your Personal Profile',
      text: 'Create your account and answer questions about your skin type, health history, allergies, and lifestyle for LADANV to understand you.',
    },
    {
      icon: <ArrowBigDownDash size={32} />,
      title: 'Analyze Any Ingredient',
      text: 'Use the AI Scan tool to check barcodes or search ingredients. Instantly see function, risk, and if it matches your personal profile.',
    },
    {
      icon: <CreditCard size={32} />,
      title: 'Receive & Refine Recommendations',
      text: 'Get recommendations for skincare and supplements. Use the journal to track progress, and LADANV will learn to optimize advice over time.',
    },
  ],
};

// Overview
export const overviewData = {
  sectionSubtitle: 'WHY LADANV?',
  sectionTitle: 'The Trusted, Ad-Free Information Assistant',
  sectionText:
    'LADANV is Built on Unshakable Science and a Spirit of Transparency',
  listTitle: 'More than 1M+ people around the world are already using',
  list: [
    {
      title: '10,000+',
      text: 'Ingredients Analyzed',
    },
    {
      title: '4.86',
      text: 'AI Analysis Accuracy',
    },
    {
      title: '20+',
      text: 'Dermatology & Pharma Consultants',
    },
  ],
};

// Review
export const reviewData = {
  sectionSubtitle: 'TESTIMONIALS',
  sectionTitle: 'How LADANV Changed Their Skincare',
  reviewCard: [
    {
      title: 'LADANV là công cụ duy nhất nói sự thật',
      text: 'Tôi từng tốn rất nhiều tiền và thời gian đọc review. Giờ tôi chỉ cần quét mã vạch, và GENIE cho tôi biết chính xác thành phần đó có hợp với tôi không. Tôi đã ngừng mua sắm theo cảm tính.',
      reviewAuthor: 'Ngoc Han',
      date: '3month ago',
    },
    {
      title: 'Nhờ tính năng cảnh báo của LADANV mà tôi đã thoát khỏi kích ứng',
      text: 'Da tôi rất nhạy cảm với silicone. Chỉ cần tạo hồ sơ dị ứng, GENIE tự động cảnh báo mọi sản phẩm có silicone. Thói quen chăm sóc da của tôi đã sạch sẽ và hiệu quả hơn rất nhiều.',
      reviewAuthor: 'Minh Khoi',
      date: '2month ago',
    },
    {
      title: 'LADANV là một khoản đầu tư thông minh',
      text: 'Không chỉ giúp tôi chọn mỹ phẩm đúng, mà còn gợi ý thực phẩm bổ sung phù hợp với tình trạng da của tôi. Tôi cảm thấy mình đang chăm sóc cơ thể một cách toàn diện, dựa trên khoa học, không phải quảng cáo.',
      reviewAuthor: 'Mai Phuong',
      date: '3month ago',
    },
  ],
};

// Blog
export const blogData = {
  sectionSubtitle: 'CLEAN KNOWLEDGE HUB',
  sectionTitle: 'Transparent Data & Knowledge Center',
  sectionText:
    'Explore deep ingredient analysis, science-backed skincare tips, and holistic wellness knowledge, updated constantly.',
  blogs: [
    {
      imgSrc: blog1,
      badge: 'SCIENTIFIC INGREDIENT',
      title: 'How Does Hyaluronic Acid Truly Affect Vietnamese Skin?',
      author: {
        avatarSrc: avatar1,
        authorName: 'Dr. Emily Carter',
        publishDate: 'Oct 10, 2024',
        readingTime: '8 min read',
      },
    },
    {
      imgSrc: blog2,
      badge: 'WELLNESS & NUTRITION',
      title: 'Decoding Lifestyle: 5 Eating Habits That Trigger Hormonal Acne',
      author: {
        avatarSrc: avatar2,
        authorName: 'Dr. Mai Nguyen',
        publishDate: 'Jul 15, 2024',
        readingTime: '5 min read',
      },
    },
    {
      imgSrc: blog3,
      badge: 'TRUTH & TRANSPARENCY',
      title: 'Common Misconceptions: Are Corticosteroids Really Banned in All Cosmetics?',
      author: {
        avatarSrc: avatar3,
        authorName: 'Ralph Edwards',
        publishDate: 'Mar 24, 2024',
        readingTime: '2 min read',
      },
    },
  ],
};

// Cta
export const ctaData = {
  text: 'Start Tracking Your Routine to See Real Skin Improvement',
};

// Footer
export const footerData = {
  links: [
    {
      title: 'Solutions',
      items: [
        {
          href: '#',
          label: 'AI Ingredient Scan',
        },
        {
          href: '#',
          label: 'Profile Builder',
        },
        {
          href: '#',
          label: 'Risk Alerts',
        },
        {
          href: '#',
          label: 'Skincare Journal',
        },
      ],
    },
    {
      title: 'Developers',
      items: [
        {
          href: '#',
          label: 'Documentation',
        },
        {
          href: '#',
          label: 'Discord server',
        },
        {
          href: '#',
          label: 'Support',
        },
        {
          href: '#',
          label: 'Glossary',
        },
        {
          href: '#',
          label: 'Changelog',
        },
      ],
    },
    {
      title: 'Company',
      items: [
        {
          href: '#',
          label: 'About',
        },
        {
          href: '#',
          label: 'Careers',
        },
        {
          href: '#',
          label: 'Blog',
        },
        {
          href: '#',
          label: 'Contact',
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          href: '#',
          label: 'Terms and Conditions',
        },
        {
          href: '#',
          label: 'Privacy Policy',
        },
        {
          href: '#',
          label: 'Data Processing Agreement',
        },
        {
          href: '#',
          label: 'Cookie manager',
        },
      ],
    },
  ],
  copyright: '© 2025 NguyenTrongNguyen',
  socialLinks: [
    {
      href: '#',
      icon: <Twitter size={18} />,
    },
    {
      href: '#',
      icon: <Github size={18} />,
    },
    {
      href: '#',
      icon: <Linkedin size={18} />,
    },
    {
      href: '#',
      icon: <Instagram size={18} />,
    },
    {
      href: '#',
      icon: <Youtube size={18} />,
    },
  ],
};
