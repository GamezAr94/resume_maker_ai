import { SubscriptionPlan, TokenPack } from '@/utils/interfaces';

/**
 * Defines the token costs for various actions within the application.
 * This provides a central place to manage monetization.
 */
export const TOKEN_COSTS = {
    // Cost for one AI resume generation
    AI_RESUME_GENERATION: 1,

    // Cost for AI-powered quick import from a document
    AI_QUICK_IMPORT: 50,

    // Future actions can be added here, for example:
    // AI_COVER_LETTER_GENERATION: 150,
    // AI_INTERVIEW_PREP_QUESTIONS: 75,

    TOKEN_PACKAGES: {
        // Define token packages with their respective costs
        BASIC: {
            id: 'basic-150-tokens',
            tokens: 150,
            price: 9, // Cost in dollars
            isPopular: false,
        },
        PREMIUM: {
            id: 'premium-300-tokens',
            tokens: 300,
            price: 15, // Cost in dollars
            isPopular: true,
        },
        /*
        ULTIMATE: {
            id: 'ultimate-125-tokens',
            tokens: 125,
            price: 57, // Cost in dollars
            isPopular: false,
        },
        */
    } as Record<string, TokenPack>,

    TOKEN_PLANS: {
        MONTHLY: {
            //id: 'price_1S6xt6PxaFwrUyBL5WKsVtBV', // Replace with your monthly plan Price ID - PRODUCTION
            id: 'price_1S75qIL71lvTP9oNjKP81tlr', // Replace with your monthly plan Price ID - DEVELOPMENT
            tierIdentifier: 'monthly',
            name: 'Monthly Pro',
            price: 22,
            priceAnnotation: '/month',
            tokens: 50, // Monthly tokens included
            features: [
                '50 tokens/month',
                'Priority support',
                'Exclusive 10% discount on all credit top-ups',
                //'Advanced features',
                'Discounted top-ups',
            ],
            isPopular: true,
        },
        YEARLY: {
            //id: 'price_1S6xs0PxaFwrUyBLp54pgRbr', // Replace with your yearly plan Price ID - PRODUCTION
            id: 'price_1S75sRL71lvTP9oNdTWdMopn', // Replace with your yearly plan Price ID - DEVELOPMENT
            tierIdentifier: 'yearly',
            name: 'Yearly Pro',
            price: 18.33, //$220 per year $18.33 a month billed annually
            priceAnnotation: '/month, billed annually',
            tokens: 600, // Yearly tokens included
            features: [
                '600 tokens/year',
                'Get 2 months free',
                'Priority support',
                'Exclusive 20% discount on all credit top-ups',
                //'Advanced features',
                'Discounted top-ups',
                'Billed annually at $220',
            ],
            isPopular: false,
            //discountBadge: '16% off',
            discountBadge: '2 months free!',
        },
    } as Record<string, SubscriptionPlan>,

    // If the user has a subscription, they get discounted token packs
    DISCOUNTED_PACKAGES: {
        free: 0,
        monthly: 0.1,
        yearly: 0.2,
    },
};
