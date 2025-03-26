import { ArrowRight, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button"; 
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import hero from "/hero.jpg";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const popIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
};

const Landing = () => {
  // Refs for scroll animations
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });
  
  const featuresRef = useRef(null);
  const isFeatureInView = useInView(featuresRef, { once: false, margin: "-100px" });
  
  const ctaRef = useRef(null);
  const isCTAInView = useInView(ctaRef, { once: true });
  
  const { scrollYProgress } = useScroll();
  const heroImageScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
  const heroImageOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 relative">
      {/* Animated background grid */}
      <motion.div 
        className="fixed inset-0 -z-10 opacity-30 dark:opacity-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.5 }}
      >
        <div className="absolute inset-0 bg-grid-pattern bg-[length:50px_50px] [mask-image:radial-gradient(white,transparent_80%)]" />
      </motion.div>
      
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section - With Enhanced Animations */}
        <section className="relative py-20 lg:py-32 overflow-hidden" ref={heroRef}>
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <motion.div 
                initial="hidden"
                animate={isHeroInView ? "visible" : "hidden"}
                variants={staggerContainer}
                className="flex flex-col justify-center space-y-6 max-w-xl mx-auto lg:mx-0"
              >
                <motion.div 
                  variants={fadeInUp}
                  className="inline-flex p-1 pr-3 bg-indigo-50 rounded-full shadow-sm dark:bg-indigo-900/30"
                >
                  <span className="inline-flex items-center rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white mr-2">New</span>
                  <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">100% Free Access</span>
                </motion.div>
                
                <motion.h1 
                  variants={fadeInUp}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white"
                >
                  <motion.span 
                    className="block"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.7 }}
                  >
                    Organize work with
                  </motion.span>
                  <motion.span 
                    className="block text-indigo-600 dark:text-indigo-400"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.7 }}
                  >
                    nested task hierarchy
                  </motion.span>
                </motion.h1>
                
                <motion.p 
                  variants={fadeInUp}
                  className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed"
                >
                  TaskNest helps teams break down complex projects into manageable pieces with unlimited subtask nesting and powerful collaboration tools.
                </motion.p>
                
                <motion.div 
                  variants={fadeInUp}
                  className="flex flex-col sm:flex-row gap-4 pt-4"
                >
                  <Button 
                    size="lg" 
                    className="h-14 px-8 text-base shadow-md hover:shadow-lg transition-all relative overflow-hidden group" 
                    asChild
                  >
                    <Link to="/signup" className="gap-2">
                      Get Started Free
                      <motion.div
                        initial={{ x: -4 }}
                        animate={{ x: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                          repeat: Infinity,
                          repeatType: "mirror",
                          repeatDelay: 1
                        }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.div>
                      <motion.div 
                        className="absolute inset-0 bg-white/20 dark:bg-white/10"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                      />
                    </Link>
                  </Button>
                  
                  <Button variant="outline" size="lg" className="h-14 px-8 text-base" asChild>
                    <Link to="/login">
                      Sign In
                    </Link>
                  </Button>
                </motion.div>
                
                <motion.div 
                  variants={fadeInUp}
                  className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium"
                >
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                  <span>No credit card required • All features included</span>
                </motion.div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative mx-auto lg:mr-0 w-full max-w-[580px] perspective-1000"
              >
                {/* Improved hero image container with 3D effect */}
                <motion.div 
                  className="relative z-10 rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-gray-900/10 dark:bg-gray-800 dark:ring-gray-700 aspect-[4/3] overflow-hidden"
                  initial={{ rotateY: 10, rotateX: -10 }}
                  whileHover={{ rotateY: -5, rotateX: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <motion.div 
                    style={{ 
                      scale: heroImageScale,
                      opacity: heroImageOpacity 
                    }}
                    className="h-full w-full"
                  >
                    <img
                      src={hero}
                      alt="TaskNest interface showing nested task hierarchy"
                      className="rounded-lg w-full h-full object-cover object-center"
                    />
                  </motion.div>
                </motion.div>
                
                {/* Animated decorative elements */}
                <motion.div 
                  className="absolute -bottom-4 -left-12 -z-10 h-24 w-24 rounded-full bg-indigo-600 blur-2xl opacity-20"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.3, 0.2]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse" 
                  }}
                />
                <motion.div 
                  className="absolute -top-6 -right-12 -z-10 h-32 w-32 rounded-full bg-indigo-400 blur-3xl opacity-20"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.25, 0.2]
                  }}
                  transition={{ 
                    duration: 7,
                    repeat: Infinity,
                    repeatType: "reverse" 
                  }}
                />
                
                {/* Floating UI elements */}
                <motion.div 
                  className="absolute -right-8 top-1/4 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-lg flex items-center gap-2 z-20"
                  initial={{ opacity: 0, y: 20, rotate: 5 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  style={{ width: "130px" }}
                >
                  <div className="w-6 h-6 rounded-full bg-green-500 flex-shrink-0" />
                  <div className="space-y-1">
                    <div className="h-2 w-16 bg-gray-200 dark:bg-gray-600 rounded-full" />
                    <div className="h-2 w-12 bg-gray-200 dark:bg-gray-600 rounded-full" />
                  </div>
                </motion.div>
                
                <motion.div 
                  className="absolute -left-10 bottom-1/3 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-lg z-20"
                  initial={{ opacity: 0, y: -20, rotate: -5 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ delay: 1.5, duration: 0.8 }}
                  style={{ width: "100px" }}
                >
                  <div className="space-y-1">
                    <div className="h-2 w-full bg-indigo-200 dark:bg-indigo-600 rounded-full" />
                    <div className="h-2 w-3/4 bg-gray-200 dark:bg-gray-600 rounded-full" />
                    <div className="h-2 w-1/2 bg-gray-200 dark:bg-gray-600 rounded-full" />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Features Section - Enhanced with better cards and animations */}
        <section className="py-24 bg-white dark:bg-gray-900" ref={featuresRef}>
          <div className="container px-4 md:px-6">
            <motion.div 
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isFeatureInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7 }}
            >
              <div className="space-y-2">
                <motion.div 
                  className="inline-flex h-6 animate-background-shine items-center justify-center rounded-full border border-gray-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-3 font-medium text-gray-100 dark:text-gray-200"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  Key Features
                </motion.div>
                <motion.h2 
                  className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900 dark:text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isFeatureInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  Everything you need to manage complex tasks
                </motion.h2>
                <motion.p 
                  className="mx-auto max-w-[800px] text-gray-600 dark:text-gray-400 md:text-xl/relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isFeatureInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                >
                  TaskNest's powerful features help teams stay organized and boost productivity
                </motion.p>
              </div>
            </motion.div>
            
            <motion.div 
              className="mx-auto grid max-w-6xl grid-cols-1 gap-8 py-16 md:grid-cols-2 lg:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              animate={isFeatureInView ? "visible" : "hidden"}
            >
              {/* Feature 1 - Enhanced card */}
              <motion.div 
                variants={popIn}
                whileHover={{ y: -8, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                className="group relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-800/50"
              >
                <motion.div 
                  className="absolute right-6 top-6 h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30"
                  whileHover={{ scale: 1.5, backgroundColor: "#c7d2fe" }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                />
                <motion.div 
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30"
                  whileHover={{ rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-7 w-7 text-indigo-600 dark:text-indigo-400"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </motion.div>
                <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">Unlimited Task Nesting</h3>
                <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
                  Build complex hierarchies with unlimited subtasks to organize your projects with precision and clarity.
                </p>
                <motion.ul 
                  className="mt-6 space-y-2"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <motion.li 
                    variants={fadeInUp} 
                    className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4 text-indigo-500" /> 
                    Infinite nesting levels
                  </motion.li>
                  <motion.li 
                    variants={fadeInUp} 
                    className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4 text-indigo-500" /> 
                    Collapsible task trees
                  </motion.li>
                  <motion.li 
                    variants={fadeInUp} 
                    className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4 text-indigo-500" /> 
                    Batch actions for subtasks
                  </motion.li>
                </motion.ul>
              </motion.div>
              
              {/* Feature 2 - Enhanced card */}
              <motion.div 
                variants={popIn}
                whileHover={{ y: -8, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                className="group relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-800/50"
              >
                <motion.div 
                  className="absolute right-6 top-6 h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30"
                  whileHover={{ scale: 1.5, backgroundColor: "#c7d2fe" }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                />
                <motion.div 
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30"
                  whileHover={{ rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-7 w-7 text-indigo-600 dark:text-indigo-400"
                  >
                    <path d="M8 2v4"></path>
                    <path d="M16 2v4"></path>
                    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                    <path d="M3 10h18"></path>
                    <path d="M10 16h4"></path>
                  </svg>
                </motion.div>
                <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">Custom Tags & Filters</h3>
                <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
                  Create custom tags to categorize and filter tasks across different projects and hierarchies for better organization.
                </p>
                <motion.ul 
                  className="mt-6 space-y-2"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <motion.li 
                    variants={fadeInUp} 
                    className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4 text-indigo-500" /> 
                    Color-coded tagging system
                  </motion.li>
                  <motion.li 
                    variants={fadeInUp} 
                    className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4 text-indigo-500" /> 
                    Custom saved filters
                  </motion.li>
                  <motion.li 
                    variants={fadeInUp} 
                    className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4 text-indigo-500" /> 
                    Cross-project categorization
                  </motion.li>
                </motion.ul>
              </motion.div>
              
              {/* Feature 3 - Enhanced card */}
              <motion.div 
                variants={popIn}
                whileHover={{ y: -8, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                className="group relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-800/50"
              >
                <motion.div 
                  className="absolute right-6 top-6 h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30"
                  whileHover={{ scale: 1.5, backgroundColor: "#c7d2fe" }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                />
                <motion.div 
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30"
                  whileHover={{ rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-7 w-7 text-indigo-600 dark:text-indigo-400"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                    <path d="M7 7h10"></path>
                    <path d="M7 12h10"></path>
                    <path d="M7 17h10"></path>
                  </svg>
                </motion.div>
                <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">Team Collaboration</h3>
                <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
                  Work seamlessly with your team, assign tasks, and comment with @mentions for clear communication and accountability.
                </p>
                <motion.ul 
                  className="mt-6 space-y-2"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <motion.li 
                    variants={fadeInUp} 
                    className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4 text-indigo-500" /> 
                    Real-time comments
                  </motion.li>
                  <motion.li 
                    variants={fadeInUp} 
                    className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4 text-indigo-500" /> 
                    @mention notifications
                  </motion.li>
                  <motion.li 
                    variants={fadeInUp} 
                    className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4 text-indigo-500" /> 
                    Shared workspaces
                  </motion.li>
                </motion.ul>
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        {/* How It Works - With Animation */}
        <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center text-center mb-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="space-y-2 max-w-3xl"
              >
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium dark:bg-gray-800">
                  How TaskNest Works
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900 dark:text-white">
                  A better way to manage tasks
                </h2>
                <p className="text-gray-600 dark:text-gray-400 md:text-xl/relaxed">
                  See how TaskNest transforms complex projects into manageable workflows
                </p>
              </motion.div>
            </div>
            
            <motion.div 
              className="grid gap-12 lg:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div 
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="flex flex-col items-center text-center space-y-4"
              >
                <motion.div 
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <motion.span 
                    className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  >
                    1
                  </motion.span>
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create Tasks & Subtasks</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Build task hierarchies with unlimited nesting to break down complex projects into manageable pieces.
                </p>
              </motion.div>
              
              <motion.div 
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="flex flex-col items-center text-center space-y-4"
              >
                <motion.div 
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <motion.span 
                    className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
                  >
                    2
                  </motion.span>
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Collaborate With Team</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Assign tasks, comment with @mentions, and track progress in real-time with your entire team.
                </p>
              </motion.div>
              
              <motion.div 
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="flex flex-col items-center text-center space-y-4"
              >
                <motion.div 
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <motion.span 
                    className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                  >
                    3
                  </motion.span>
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Track & Complete</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Monitor progress with intuitive dashboards and complete tasks efficiently with automatic parent task updates.
                </p>
              </motion.div>
            </motion.div>
            
            {/* Connection lines between steps */}
            <div className="hidden lg:block relative h-20 mt-8">
              <motion.div 
                className="absolute top-10 left-1/6 right-5/6 h-0.5 bg-indigo-200 dark:bg-indigo-900/50"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                viewport={{ once: true }}
              />
              <motion.div 
                className="absolute top-10 left-[42%] right-[42%] h-0.5 bg-indigo-200 dark:bg-indigo-900/50"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                viewport={{ once: true }}
              />
            </div>
          </div>
        </section>
        
        {/* Call to Action - Enhanced with animations */}
        <section className="py-24 relative overflow-hidden" ref={ctaRef}>
          {/* Animated background gradient */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-[0.15] dark:opacity-[0.07]"
            animate={{ 
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{ 
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            style={{ backgroundSize: "200% 200%" }}
          />
          
          <div className="container relative px-4 md:px-6 z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={isCTAInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col items-center justify-center space-y-8 text-center max-w-3xl mx-auto"
            >
              <div className="space-y-4">
                <motion.h2 
                  className="text-4xl font-bold tracking-tighter md:text-5xl text-gray-900 dark:text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isCTAInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  Ready to transform how you manage tasks?
                </motion.h2>
                <motion.p 
                  className="mx-auto max-w-[700px] text-xl text-gray-600 dark:text-gray-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isCTAInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                >
                  Start using TaskNest today - 100% free with all features included
                </motion.p>
              </div>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={isCTAInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-base shadow-md relative overflow-hidden" 
                  asChild
                >
                  <Link to="/signup">
                    Create Free Account
                    <motion.div 
                      className="absolute inset-0 bg-white/20 dark:bg-white/10"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-14 px-8 text-base bg-white/90 dark:bg-gray-900/90" 
                  asChild
                >
                  <Link to="#" className="gap-2 group">
                    Watch Demo
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "loop"
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.div>
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div 
                className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={isCTAInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
              >
                <motion.div
                  whileHover={{ scale: 1.2, color: "#22c55e" }}
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </motion.div>
                <span>Free forever • All features included • No credit card required</span>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
      
      {/* Cursor follower - subtle effect */}
      <motion.div 
        className="hidden md:block fixed w-4 h-4 rounded-full bg-indigo-500/20 pointer-events-none z-50"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        style={{ 
          left: -20,
          top: -20,
          mixBlendMode: "difference"
        }}
      />
    </div>
  );
};

export default Landing;