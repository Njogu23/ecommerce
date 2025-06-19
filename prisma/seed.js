const { PrismaClient } = require('@prisma/client');
const { Decimal } = require('@prisma/client/runtime/library');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting expanded seed...');

  // Clean existing data (in correct order due to foreign key constraints)
  await prisma.inventoryLog.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create Users (Original 4 + 10 new users)
  const users = await Promise.all([
    // Original users
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
    }),
    // New users
    prisma.user.create({
      data: {
        username: 'sarah_jones',
        email: 'sarah@example.com',
        phone: '+1234567894',
        role: 'CUSTOMER',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        password: "123456"
      }
    }),
    prisma.user.create({
      data: {
        username: 'alex_chen',
        email: 'alex@example.com',
        phone: '+1234567895',
        role: 'CUSTOMER',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
        password: "123456"
      }
    }),
    prisma.user.create({
      data: {
        username: 'emily_brown',
        email: 'emily@example.com',
        phone: '+1234567896',
        role: 'CUSTOMER',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        password: "123456"
      }
    }),
    prisma.user.create({
      data: {
        username: 'david_garcia',
        email: 'david@example.com',
        phone: '+1234567897',
        role: 'CUSTOMER',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
        password: "123456"
      }
    }),
    prisma.user.create({
      data: {
        username: 'lisa_taylor',
        email: 'lisa@example.com',
        phone: '+1234567898',
        role: 'CUSTOMER',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
        password: "123456"
      }
    }),
    prisma.user.create({
      data: {
        username: 'ryan_lee',
        email: 'ryan@example.com',
        phone: '+1234567899',
        role: 'CUSTOMER',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=face',
        password: "123456"
      }
    }),
    prisma.user.create({
      data: {
        username: 'maria_rodriguez',
        email: 'maria@example.com',
        phone: '+1234567800',
        role: 'CUSTOMER',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
        password: "123456"
      }
    }),
    prisma.user.create({
      data: {
        username: 'james_anderson',
        email: 'james@example.com',
        phone: '+1234567801',
        role: 'CUSTOMER',
        avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150&h=150&fit=crop&crop=face',
        password: "123456"
      }
    }),
    prisma.user.create({
      data: {
        username: 'sophia_martinez',
        email: 'sophia@example.com',
        phone: '+1234567802',
        role: 'CUSTOMER',
        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
        password: "123456"
      }
    }),
    prisma.user.create({
      data: {
        username: 'kevin_white',
        email: 'kevin@example.com',
        phone: '+1234567803',
        role: 'CUSTOMER',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        password: "123456"
      }
    })
  ]);

  console.log('✅ Created users');

  // Create Categories (Expanded with more categories)
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
    }),
    prisma.category.create({
      data: {
        name: 'Sports & Outdoors',
        slug: 'sports-outdoors',
        description: 'Sports equipment and outdoor gear',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Beauty & Health',
        slug: 'beauty-health',
        description: 'Beauty products and health essentials',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop'
      }
    })
  ]);

  console.log('✅ Created categories');

  // Create Products (Expanded with more products) - ALL PRICES CONVERTED TO KES
  const products = await Promise.all([
    // Electronics
    prisma.product.create({
      data: {
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        description: 'The latest iPhone with advanced camera system and A17 Pro chip',
        price: new Decimal('129998.70'), // 999.99 * 130
        tax: 8,
        discount: 5,
        costPrice: new Decimal('97500.00'), // 750.00 * 130
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
        price: new Decimal('42898.70'), // 329.99 * 130
        tax: 8,
        discount: 10,
        costPrice: new Decimal('32500.00'), // 250.00 * 130
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
    prisma.product.create({
      data: {
        name: 'MacBook Pro 14"',
        slug: 'macbook-pro-14',
        description: 'Powerful laptop with M3 Pro chip for professional work',
        price: new Decimal('259998.70'), // 1999.99 * 130
        tax: 8,
        discount: 3,
        costPrice: new Decimal('195000.00'), // 1500.00 * 130
        categoryId: categories[0].id,
        avgRating: new Decimal('4.9'),
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop',
              altText: 'MacBook Pro 14 inch'
            }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Sony WH-1000XM5 Headphones',
        slug: 'sony-wh-1000xm5',
        description: 'Premium noise-canceling wireless headphones',
        price: new Decimal('51998.70'), // 399.99 * 130
        tax: 8,
        discount: 12,
        costPrice: new Decimal('36400.00'), // 280.00 * 130
        categoryId: categories[0].id,
        avgRating: new Decimal('4.7'),
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
              altText: 'Sony WH-1000XM5 Headphones'
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
        price: new Decimal('10398.70'), // 79.99 * 130
        tax: 5,
        costPrice: new Decimal('5850.00'), // 45.00 * 130
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
        price: new Decimal('16898.70'), // 129.99 * 130
        discount: 15,
        costPrice: new Decimal('10400.00'), // 80.00 * 130
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
    prisma.product.create({
      data: {
        name: 'Wool Winter Coat',
        slug: 'wool-winter-coat',
        description: 'Warm and stylish wool coat for winter season',
        price: new Decimal('24698.70'), // 189.99 * 130
        tax: 5,
        discount: 8,
        costPrice: new Decimal('15600.00'), // 120.00 * 130
        categoryId: categories[1].id,
        avgRating: new Decimal('4.4'),
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=600&fit=crop',
              altText: 'Wool Winter Coat'
            }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Cotton T-Shirt Pack',
        slug: 'cotton-tshirt-pack',
        description: 'Pack of 3 premium cotton t-shirts in various colors',
        price: new Decimal('5198.70'), // 39.99 * 130
        tax: 5,
        costPrice: new Decimal('2600.00'), // 20.00 * 130
        categoryId: categories[1].id,
        avgRating: new Decimal('4.2'),
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
              altText: 'Cotton T-Shirt Pack'
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
        price: new Decimal('38998.70'), // 299.99 * 130
        costPrice: new Decimal('23400.00'), // 180.00 * 130
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
        price: new Decimal('11698.70'), // 89.99 * 130
        discount: 20,
        costPrice: new Decimal('6500.00'), // 50.00 * 130
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
    prisma.product.create({
      data: {
        name: 'Ceramic Dinnerware Set',
        slug: 'ceramic-dinnerware-set',
        description: 'Elegant 16-piece ceramic dinnerware set',
        price: new Decimal('19498.70'), // 149.99 * 130
        tax: 7,
        costPrice: new Decimal('11050.00'), // 85.00 * 130
        categoryId: categories[2].id,
        avgRating: new Decimal('4.6'),
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&h=600&fit=crop',
              altText: 'Ceramic Dinnerware Set'
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
        price: new Decimal('6498.70'), // 49.99 * 130
        costPrice: new Decimal('3250.00'), // 25.00 * 130
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
        price: new Decimal('3248.70'), // 24.99 * 130
        costPrice: new Decimal('1560.00'), // 12.00 * 130
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
    }),
    prisma.product.create({
      data: {
        name: 'Cooking Masterclass',
        slug: 'cooking-masterclass',
        description: 'Professional cooking techniques and recipes',
        price: new Decimal('4548.70'), // 34.99 * 130
        costPrice: new Decimal('2340.00'), // 18.00 * 130
        categoryId: categories[3].id,
        avgRating: new Decimal('4.8'),
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop',
              altText: 'Cooking Masterclass book'
            }
          ]
        }
      }
    }),
    // Sports & Outdoors
    prisma.product.create({
      data: {
        name: 'Yoga Mat Premium',
        slug: 'yoga-mat-premium',
        description: 'High-quality non-slip yoga mat for all skill levels',
        price: new Decimal('7798.70'), // 59.99 * 130
        discount: 10,
        costPrice: new Decimal('3900.00'), // 30.00 * 130
        categoryId: categories[4].id,
        avgRating: new Decimal('4.5'),
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop',
              altText: 'Premium Yoga Mat'
            }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Camping Tent 4-Person',
        slug: 'camping-tent-4person',
        description: 'Waterproof 4-person camping tent with easy setup',
        price: new Decimal('25998.70'), // 199.99 * 130
        tax: 6,
        discount: 15,
        costPrice: new Decimal('15600.00'), // 120.00 * 130
        categoryId: categories[4].id,
        avgRating: new Decimal('4.3'),
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=600&fit=crop',
              altText: '4-Person Camping Tent'
            }
          ]
        }
      }
    }),
    // Beauty & Health
    prisma.product.create({
      data: {
        name: 'Skincare Essential Kit',
        slug: 'skincare-essential-kit',
        description: 'Complete skincare routine with cleanser, toner, and moisturizer',
        price: new Decimal('10398.70'), // 79.99 * 130
        tax: 5,
        discount: 5,
        costPrice: new Decimal('5200.00'), // 40.00 * 130
        categoryId: categories[5].id,
        avgRating: new Decimal('4.4'),
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&h=600&fit=crop',
              altText: 'Skincare Essential Kit'
            }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Vitamin C Serum',
        slug: 'vitamin-c-serum',
        description: 'Brightening vitamin C serum for radiant skin',
        price: new Decimal('3898.70'), // 29.99 * 130
        costPrice: new Decimal('1950.00'), // 15.00 * 130
        categoryId: categories[5].id,
        avgRating: new Decimal('4.6'),
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600&h=600&fit=crop',
              altText: 'Vitamin C Serum'
            }
          ]
        }
      }
    })
  ]);

  console.log('✅ Created products');

  // Create Inventory for all products
  const inventoryData = products.map((product, index) => ({
    productId: product.id,
    quantity: 20 + Math.floor(Math.random() * 80), // Random quantity between 20-100
    lowStockThreshold: 5 + Math.floor(Math.random() * 15) // Random threshold between 5-20
  }));

  const inventories = await Promise.all(
    inventoryData.map(data => 
      prisma.inventory.create({
        data: {
          productId: data.productId,
          quantity: data.quantity,
          lowStockThreshold: data.lowStockThreshold,
          inStock: data.quantity > 0
        }
      })
    )
  );

  console.log('✅ Created inventory records');

  // Create inventory logs for initial stock
  const initialInventoryLogs = await Promise.all(
    inventories.map(inventory => 
      prisma.inventoryLog.create({
        data: {
          inventoryId: inventory.id,
          change: inventory.quantity,
          newQuantity: inventory.quantity,
          reason: 'initial_stock',
          metadata: { note: 'Initial inventory setup' }
        }
      })
    )
  );

  console.log('✅ Created initial inventory logs');

  // Create more comprehensive reviews
  const reviewData = [
    { productId: products[0].id, userId: users[1].id, rating: 5, content: 'Amazing phone! The camera quality is outstanding and the performance is smooth.', isVerified: true },
    { productId: products[0].id, userId: users[2].id, rating: 4, content: 'Great phone overall, but the battery could be better.', isVerified: true },
    { productId: products[0].id, userId: users[5].id, rating: 5, content: 'Love the new features, especially the Action Button!', isVerified: true },
    { productId: products[1].id, userId: users[1].id, rating: 5, content: 'Perfect smartwatch for fitness tracking. Highly recommended!', isVerified: true },
    { productId: products[1].id, userId: users[6].id, rating: 4, content: 'Good watch but takes time to get used to the interface.', isVerified: true },
    { productId: products[2].id, userId: users[7].id, rating: 5, content: 'Incredible performance for professional work. Worth every penny!', isVerified: true },
    { productId: products[3].id, userId: users[8].id, rating: 4, content: 'Excellent noise cancellation, great for flights.', isVerified: true },
    { productId: products[5].id, userId: users[2].id, rating: 5, content: 'Very comfortable running shoes. Great for daily workouts.', isVerified: true },
    { productId: products[5].id, userId: users[9].id, rating: 4, content: 'Good quality but wish they had more color options.', isVerified: true },
    { productId: products[6].id, userId: users[10].id, rating: 5, content: 'Perfect for winter! Keeps me warm and looks stylish.', isVerified: true },
    { productId: products[11].id, userId: users[3].id, rating: 5, content: 'Excellent programming book. Clear explanations and practical examples.', isVerified: true },
    { productId: products[12].id, userId: users[11].id, rating: 4, content: 'Very helpful for stress relief. Highly recommend!', isVerified: true },
    { productId: products[13].id, userId: users[12].id, rating: 5, content: 'Amazing recipes! My cooking has improved dramatically.', isVerified: true },
    { productId: products[14].id, userId: users[13].id, rating: 4, content: 'Great yoga mat, good grip and comfortable.', isVerified: true },
    { productId: products[16].id, userId: users[4].id, rating: 5, content: 'Love this skincare kit! My skin feels amazing.', isVerified: true }
  ];

  const reviews = await Promise.all(
    reviewData.map(review => 
      prisma.review.create({
        data: {
          ...review,
          isApproved: true
        }
      })
    )
  );

  console.log('✅ Created reviews');

  // Create expanded carts - PRICES CONVERTED TO KES
  const carts = await Promise.all([
    prisma.cart.create({
      data: {
        userId: users[1].id,
        items: {
          create: [
            { productId: products[0].id, quantity: 1, price: products[0].price },
            { productId: products[4].id, quantity: 2, price: products[4].price }
          ]
        }
      }
    }),
    prisma.cart.create({
      data: {
        userId: users[2].id,
        items: {
          create: [
            { productId: products[1].id, quantity: 1, price: products[1].price },
            { productId: products[14].id, quantity: 1, price: products[14].price }
          ]
        }
      }
    }),
    prisma.cart.create({
      data: {
        userId: users[5].id,
        items: {
          create: [
            { productId: products[2].id, quantity: 1, price: products[2].price }
          ]
        }
      }
    }),
    prisma.cart.create({
      data: {
        sessionId: 'guest_session_123',
        items: {
          create: [
            { productId: products[8].id, quantity: 1, price: products[8].price },
            { productId: products[16].id, quantity: 2, price: products[16].price }
          ]
        }
      }
    }),
    prisma.cart.create({
      data: {
        sessionId: 'guest_session_456',
        items: {
          create: [
            { productId: products[15].id, quantity: 1, price: products[15].price }
          ]
        }
      }
    })
  ]);

  console.log('✅ Created carts');

  // Create 23 orders (3 original + 20 new)
  const orderStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  const states = ['NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
  const cities = ['New York', 'Los Angeles', 'Houston', 'Miami', 'Chicago', 'Philadelphia', 'Columbus', 'Atlanta', 'Charlotte', 'Detroit'];

  const orders = [];

  // Original 3 orders
  const originalOrders = await Promise.all([
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
            { productId: products[0].id, quantity: 1, price: new Decimal('999.99') },
            { productId: products[4].id, quantity: 1, price: new Decimal('79.99') }
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
        tax: new Decimal('46.00'),
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
            { productId: products[1].id, quantity: 1, price: new Decimal('329.99') },
            { productId: products[5].id, quantity: 1, price: new Decimal('129.99') }
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
        tax: new Decimal('5.25'),
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
            { productId: products[11].id, quantity: 1, price: new Decimal('49.99') },
            { productId: products[12].id, quantity: 1, price: new Decimal('24.99') }
          ]
        }
      }
    })
  ]);

  orders.push(...originalOrders);

  // Generate 20 new orders
  for (let i = 4; i <= 23; i++) {
    const userIndex = Math.floor(Math.random() * (users.length - 1)) + 1; // Skip admin user
    const randomProducts = [];
    const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
    
    let subtotal = new Decimal('0');
    
    // Select random products for this order
    for (let j = 0; j < numItems; j++) {
      const productIndex = Math.floor(Math.random() * products.length);
      const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 quantity
      const price = products[productIndex].price;
      
      randomProducts.push({
        productId: products[productIndex].id,
        quantity: quantity,
        price: price
      });
      
      subtotal = subtotal.add(price.mul(quantity));
    }
    
    const tax = subtotal.mul(0.08); // 8% tax
    const discount = Math.random() > 0.7 ? subtotal.mul(0.05) : new Decimal('0'); // 30% chance of 5% discount
    const total = subtotal.add(tax).sub(discount);
    
    const stateIndex = Math.floor(Math.random() * states.length);
    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
    
    const newOrder = await prisma.order.create({
      data: {
        orderNumber: `ORD-2024-${String(i).padStart(3, '0')}`,
        userId: users[userIndex].id,
        status: status,
        subtotal: subtotal,
        tax: tax,
        discount: discount,
        total: total,
        email: users[userIndex].email,
        phone: users[userIndex].phone,
        shippingAddress: {
          street: `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Pine', 'Elm', 'Maple', 'Cedar'][Math.floor(Math.random() * 6)]} ${['St', 'Ave', 'Rd', 'Blvd'][Math.floor(Math.random() * 4)]}`,
          city: cities[stateIndex],
          state: states[stateIndex],
          zipCode: String(Math.floor(Math.random() * 90000) + 10000),
          country: 'USA'
        },
        items: {
          create: randomProducts
        }
      }
    });
    
    orders.push(newOrder);
  }

  console.log('✅ Created orders');

  // Update inventory quantities based on delivered and shipped orders
  const completedOrders = orders.filter(order => 
    order.status === 'DELIVERED' || order.status === 'SHIPPED'
  );

  // Get order items for inventory updates
  const orderItems = await prisma.orderItem.findMany({
    where: {
      orderId: {
        in: completedOrders.map(order => order.id)
      }
    }
  });

  // Group items by product for inventory updates
  const inventoryUpdates = {};
  orderItems.forEach(item => {
    if (!inventoryUpdates[item.productId]) {
      inventoryUpdates[item.productId] = 0;
    }
    inventoryUpdates[item.productId] += item.quantity;
  });

  // Update inventory quantities
  await Promise.all(
    Object.entries(inventoryUpdates).map(([productId, soldQuantity]) =>
      prisma.inventory.update({
        where: { productId: productId },
        data: { 
          quantity: { decrement: soldQuantity },
          inStock: true // Will be updated based on actual quantity
        }
      })
    )
  );

  // Update inStock status for products with 0 quantity
  await prisma.inventory.updateMany({
    where: { quantity: { lte: 0 } },
    data: { inStock: false }
  });

  // Create inventory logs for sales
  const salesLogs = await Promise.all(
    Object.entries(inventoryUpdates).map(async ([productId, soldQuantity]) => {
      const inventory = await prisma.inventory.findUnique({
        where: { productId: productId }
      });
      
      return prisma.inventoryLog.create({
        data: {
          inventoryId: inventory.id,
          change: -soldQuantity,
          newQuantity: inventory.quantity,
          reason: 'sale',
          metadata: { note: 'Sales from multiple orders' }
        }
      });
    })
  );

  console.log('✅ Updated inventory for sales');

  // Add some restocking logs
  const restockLogs = await Promise.all([
    prisma.inventoryLog.create({
      data: {
        inventoryId: inventories[0].id,
        change: 10,
        newQuantity: inventories[0].quantity + 10,
        reason: 'restock',
        metadata: { supplier: 'Apple Inc', batch: 'APPLE-2024-Q2' }
      }
    }),
    prisma.inventoryLog.create({
      data: {
        inventoryId: inventories[2].id,
        change: 15,
        newQuantity: inventories[2].quantity + 15,
        reason: 'restock',
        metadata: { supplier: 'Apple Inc', batch: 'APPLE-2024-Q2' }
      }
    }),
    prisma.inventoryLog.create({
      data: {
        inventoryId: inventories[4].id,
        change: 20,
        newQuantity: inventories[4].quantity + 20,
        reason: 'restock',
        metadata: { supplier: 'Fashion Wholesale Co', batch: 'FW-2024-003' }
      }
    })
  ]);

  // Update actual inventory quantities for restocked items
  await Promise.all([
    prisma.inventory.update({
      where: { id: inventories[0].id },
      data: { quantity: { increment: 10 } }
    }),
    prisma.inventory.update({
      where: { id: inventories[2].id },
      data: { quantity: { increment: 15 } }
    }),
    prisma.inventory.update({
      where: { id: inventories[4].id },
      data: { quantity: { increment: 20 } }
    })
  ]);

  console.log('✅ Created restock logs');

  console.log('🎉 Expanded seed completed successfully!');
  console.log(`
  📊 Summary:
  - Users: ${users.length} (4 original + 10 new)
  - Categories: ${categories.length} (4 original + 2 new)
  - Products: ${products.length} (8 original + 10 new)
  - Reviews: ${reviews.length}
  - Carts: ${carts.length}
  - Orders: ${orders.length} (3 original + 20 new)
  - Inventory Records: ${inventories.length}
  - Inventory Logs: ${initialInventoryLogs.length + salesLogs.length + restockLogs.length}
  - Order Statuses: ${orderStatuses.join(', ')}
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