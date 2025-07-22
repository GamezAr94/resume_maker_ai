import { SubscriptionPlan, TokenPack } from '@/utils/interfaces';

/**
 * Defines the token costs for various actions within the application.
 * This provides a central place to manage monetization.
 */
export const TOKEN_COSTS = {
    // Cost for one AI resume generation
    AI_RESUME_GENERATION: 100,

    // Cost for AI-powered quick import from a document
    AI_QUICK_IMPORT: 50,

    // Future actions can be added here, for example:
    // AI_COVER_LETTER_GENERATION: 150,
    // AI_INTERVIEW_PREP_QUESTIONS: 75,

    TOKEN_PACKAGES: {
        // Define token packages with their respective costs
        BASIC: {
            id: 'basic-5-tokens',
            tokens: 5,
            price: 9.5, // Cost in dollars
            isPopular: false,
        },
        PREMIUM: {
            id: 'premium-10-tokens',
            tokens: 10,
            price: 16, // Cost in dollars
            isPopular: true,
        },
        ULTIMATE: {
            id: 'ultimate-20-tokens',
            tokens: 15,
            price: 20, // Cost in dollars
            isPopular: false,
        },
    } as Record<string, TokenPack>,

    TOKEN_PLANS: {
        MONTHLY: {
            id: 'price_1RkVExPxaFwrUyBLBwjpCFCe', // Replace with your monthly plan Price ID
            tierIdentifier: 'monthly',
            name: 'Monthly Pro',
            price: 14,
            priceAnnotation: '/month',
            tokens: 10, // Monthly tokens included
            features: [
                '10 tokens/month',
                'Priority support',
                'Advanced features',
                'Discounted top-ups',
            ],
            isPopular: true,
        },
        YEARLY: {
            id: 'price_YEARLY_SUB', // Replace with your yearly plan Price ID
            tierIdentifier: 'yearly',
            name: 'Yearly Pro',
            price: 12,
            priceAnnotation: '/month',
            tokens: 130, // Yearly tokens included
            features: [
                '130 tokens/year',
                'Priority support',
                'Advanced features',
                'Discounted top-ups',
                '2 months free',
            ],
            isPopular: false,
            discountBadge: '14% off',
        },
    } as Record<string, SubscriptionPlan>,

    // If the user has a subscription, they get discounted token packs
    DISCOUNTED_PACKAGES: {
        free: 0,
        monthly: 0.1,
        yearly: 0.2,
    },
};
