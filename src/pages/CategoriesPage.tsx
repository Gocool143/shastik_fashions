import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategories } from '@/store/categorySlice';
import { Skeleton } from '@/components/ui/skeleton';

const CategoriesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories, status } = useAppSelector((state) => state.categories);
  const isLoading = status === 'loading';

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <>
      <Helmet>
        <title>All Categories - Shastik Fashions</title>
        <meta
          name="description"
          content="Browse all saree categories at Shastik Fashions. From luxurious silks to comfortable cottons, find the perfect saree for every occasion."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 py-8 lg:py-16">
          <div className="container mx-auto px-4">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <span className="text-gold text-sm font-semibold uppercase tracking-wider">
                Browse by
              </span>
              <h1 className="font-display text-3xl lg:text-5xl font-bold text-foreground mt-2">
                All Categories
              </h1>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                From luxurious silks to comfortable cottons, find the perfect saree for every occasion
              </p>
            </motion.div>

            {/* Categories Grid */}
            {isLoading && categories.length === 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] lg:aspect-square rounded-2xl" />
                ))}
              </div>
            ) : categories && categories.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {categories.map((category, index) => (
                  <motion.div
                    key={category._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={`/shop?category=${category.slug}`}
                      className="group block relative rounded-2xl overflow-hidden aspect-[3/4] lg:aspect-square"
                    >
                      {/* Background Image */}
                      <img
                        src={category.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80'}
                        alt={category.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

                      {/* Content */}
                      <div className="absolute inset-0 p-4 lg:p-6 flex flex-col justify-end">
                        <h2 className="font-display text-lg lg:text-2xl font-semibold text-primary-foreground mb-1">
                          {category.name}
                        </h2>
                        {category.description && (
                          <p className="text-sm text-primary-foreground/70 mb-2 line-clamp-2 hidden lg:block">
                            {category.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-primary-foreground/70">
                            Explore Collection
                          </span>
                          <span className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            <ArrowRight size={16} className="text-primary-foreground" />
                          </span>
                        </div>
                      </div>

                      {/* Decorative border on hover */}
                      <div className="absolute inset-2 border-2 border-gold/0 rounded-xl group-hover:border-gold/50 transition-colors duration-500" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No categories found.</p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CategoriesPage;
