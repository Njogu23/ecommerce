const { PrismaClient } = require('@prisma/client');
const { Decimal } = require('@prisma/client/runtime/library');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        phone: '+1234567890',
        role: 'ADMIN',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        password: "123456"
      }
    }),
    prisma.user.create({
      data: {
        username: 'john_doe',
        email: 'john@example.com',
        phone: '+1234567891',
        role: 'CUSTOMER',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        password: "123456"
      }
    }),
    prisma.user.create({
      data: {
        username: 'jane_smith',
        email: 'jane@example.com',
        phone: '+1234567892',
        role: 'CUSTOMER',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        password: "123456"
      }
    }),
    prisma.user.create({
      data: {
        username: 'mike_wilson',
        email: 'mike@example.com',
        phone: '+1234567893',
        role: 'CUSTOMER',
        password: "123456"
      }
    })
  ]);

  console.log('✅ Created users');

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Latest electronic gadgets and devices',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashion and apparel for all occasions',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Everything for your home and garden',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Books',
        slug: 'books',
        description: 'Books for learning, entertainment, and inspiration',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop'
      }
    })
  ]);

  console.log('✅ Created categories');

  // Create Products
  const products = await Promise.all([
    // Electronics
    prisma.product.create({
      data: {
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        description: 'The latest iPhone with advanced camera system and A17 Pro chip',
        price: new Decimal('999.99'),
        tax: 8,
        discount: 5,
        costPrice: new Decimal('750.00'),
        categoryId: categories[0].id,
        avgRating: new Decimal('4.8'),
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop',
              altText: 'iPhone 15 Pro front view'
            },
            {
              url: 'https://images.unsplash.com/photo-1605236453806-b25e7d4ecf04?w=600&h=600&fit=crop',
              altText: 'iPhone 15 Pro back view'
            }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Samsung Galaxy Watch 6',
        slug: 'samsung-galaxy-watch-6',
        description: 'Advanced smartwatch with health monitoring and fitness tracking',
        price: new Decimal('329.99'),
        tax: 8,
        discount: 10,
        costPrice: new Decimal('250.00'),
        categoryId: categories[0].id,
        avgRating: new Decimal('4.5'),
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
              altText: 'Samsung Galaxy Watch 6'
            }
          ]
        }
      }
    }),
    // Clothing
    prisma.product.create({
      data: {
        name: 'Classic Denim Jacket',
        slug: 'classic-denim-jacket',
        description: 'Timeless denim jacket perfect for casual wear',
        price: new Decimal('79.99'),
        tax: 5,
        costPrice: new Decimal('45.00'),
        categoryId: categories[1].id,
        avgRating: new Decimal('4.3'),
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop',
              altText: 'Classic Denim Jacket'
            }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Running Sneakers',
        slug: 'running-sneakers',
        description: 'Comfortable running shoes with excellent cushioning',
        price: new Decimal('129.99'),
        discount: 15,
        costPrice: new Decimal('80.00'),
        categoryId: categories[1].id,
        avgRating: new Decimal('4.6'),
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
              altText: 'Running Sneakers'
            }
          ]
        }
      }
    }),
    // Home & Garden
    prisma.product.create({
      data: {
        name: 'Modern Coffee Table',
        slug: 'modern-coffee-table',
        description: 'Sleek and modern coffee table for your living room',
        price: new Decimal('299.99'),
        costPrice: new Decimal('180.00'),
        categoryId: categories[2].id,
        avgRating: new Decimal('4.4'),
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop',
              altText: 'Modern Coffee Table'
            }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Garden Tool Set',
        slug: 'garden-tool-set',
        description: 'Complete set of essential gardening tools',
        price: new Decimal('89.99'),
        discount: 20,
        costPrice: new Decimal('50.00'),
        categoryId: categories[2].id,
        avgRating: new Decimal('4.2'),
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop',
              altText: 'Garden Tool Set'
            }
          ]
        }
      }
    }),
    // Books
    prisma.product.create({
      data: {
        name: 'The Art of Programming',
        slug: 'art-of-programming',
        description: 'Comprehensive guide to software development and programming principles',
        price: new Decimal('49.99'),
        costPrice: new Decimal('25.00'),
        categoryId: categories[3].id,
        avgRating: new Decimal('4.7'),
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop',
              altText: 'The Art of Programming book cover'
            }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Mindfulness and Meditation',
        slug: 'mindfulness-meditation',
        description: 'A practical guide to mindfulness and meditation techniques',
        price: new Decimal('24.99'),
        costPrice: new Decimal('12.00'),
        categoryId: categories[3].id,
        avgRating: new Decimal('4.5'),
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
              altText: 'Mindfulness and Meditation book'
            }
          ]
        }
      }
    })
  ]);

  console.log('✅ Created products');

  // Create Reviews
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        productId: products[0].id,
        userId: users[1].id,
        rating: 5,
        content: 'Amazing phone! The camera quality is outstanding and the performance is smooth.',
        isVerified: true,
        isApproved: true
      }
    }),
    prisma.review.create({
      data: {
        productId: products[0].id,
        userId: users[2].id,
        rating: 4,
        content: 'Great phone overall, but the battery could be better.',
        isVerified: true,
        isApproved: true
      }
    }),
    prisma.review.create({
      data: {
        productId: products[1].id,
        userId: users[1].id,
        rating: 5,
        content: 'Perfect smartwatch for fitness tracking. Highly recommended!',
        isVerified: true,
        isApproved: true
      }
    }),
    prisma.review.create({
      data: {
        productId: products[3].id,
        userId: users[2].id,
        rating: 5,
        content: 'Very comfortable running shoes. Great for daily workouts.',
        isVerified: true,
        isApproved: true
      }
    }),
    prisma.review.create({
      data: {
        productId: products[6].id,
        userId: users[3].id,
        rating: 5,
        content: 'Excellent programming book. Clear explanations and practical examples.',
        isVerified: true,
        isApproved: true
      }
    })
  ]);

  console.log('✅ Created reviews');

  // Create Carts
  const carts = await Promise.all([
    prisma.cart.create({
      data: {
        userId: users[1].id,
        items: {
          create: [
            {
              productId: products[0].id,
              quantity: 1,
              price: new Decimal('999.99')
            },
            {
              productId: products[2].id,
              quantity: 2,
              price: new Decimal('79.99')
            }
          ]
        }
      }
    }),
    prisma.cart.create({
      data: {
        userId: users[2].id,
        items: {
          create: [
            {
              productId: products[1].id,
              quantity: 1,
              price: new Decimal('329.99')
            }
          ]
        }
      }
    }),
    prisma.cart.create({
      data: {
        sessionId: 'guest_session_123',
        items: {
          create: [
            {
              productId: products[4].id,
              quantity: 1,
              price: new Decimal('299.99')
            }
          ]
        }
      }
    })
  ]);

  console.log('✅ Created carts');

  // Create Orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-001',
        userId: users[1].id,
        status: 'DELIVERED',
        subtotal: new Decimal('1079.98'),
        tax: new Decimal('86.40'),
        discount: new Decimal('50.00'),
        total: new Decimal('1116.38'),
        email: 'john@example.com',
        phone: '+1234567891',
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        items: {
          create: [
            {
              productId: products[0].id,
              quantity: 1,
              price: new Decimal('999.99')
            },
            {
              productId: products[2].id,
              quantity: 1,
              price: new Decimal('79.99')
            }
          ]
        }
      }
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-002',
        userId: users[2].id,
        status: 'SHIPPED',
        subtotal: new Decimal('459.98'),
        tax: 10,
        discount: new Decimal('0.00'),
        total: new Decimal('505.98'),
        email: 'jane@example.com',
        phone: '+1234567892',
        shippingAddress: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        },
        items: {
          create: [
            {
              productId: products[1].id,
              quantity: 1,
              price: new Decimal('329.99')
            },
            {
              productId: products[3].id,
              quantity: 1,
              price: new Decimal('129.99')
            }
          ]
        }
      }
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-003',
        userId: users[3].id,
        status: 'PROCESSING',
        subtotal: new Decimal('74.98'),
        tax: 7,
        discount: new Decimal('5.00'),
        total: new Decimal('75.23'),
        email: 'mike@example.com',
        phone: '+1234567893',
        shippingAddress: {
          street: '789 Pine Rd',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA'
        },
        items: {
          create: [
            {
              productId: products[6].id,
              quantity: 1,
              price: new Decimal('49.99')
            },
            {
              productId: products[7].id,
              quantity: 1,
              price: new Decimal('24.99')
            }
          ]
        }
      }
    })
  ]);

  console.log('✅ Created orders');

  console.log('🎉 Seed completed successfully!');
  console.log(`
  📊 Summary:
  - Users: ${users.length}
  - Categories: ${categories.length} 
  - Products: ${products.length}
  - Reviews: ${reviews.length}
  - Carts: ${carts.length}
  - Orders: ${orders.length}
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });