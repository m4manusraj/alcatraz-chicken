"use client"

import { motion } from "framer-motion"
import { Layout } from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, Users, Clock, ChefHat } from "lucide-react"

export default function AboutPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/20 to-black" />
        <div className="absolute inset-0 prison-bars opacity-20 pointer-events-none" />
        <div className="absolute inset-0 noise pointer-events-none" />

        <div className="container relative px-4 py-12 sm:py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4">
              OUR
              <span className="text-orange-500 ml-3">STORY</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg md:text-xl">
              Breaking free from ordinary flavor since 2023
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12 sm:py-16 bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 prison-bars opacity-10 pointer-events-none" />
        <div className="absolute inset-0 noise pointer-events-none" />

        <div className="container px-4 relative">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-center md:text-left"
            >
              <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 mb-4">
                Our Beginning
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Breaking Free From
                <span className="text-orange-500 block mt-2">Ordinary Flavor</span>
              </h2>
              <p className="text-gray-400 text-base sm:text-lg mb-6">
                Alcatraz Chicken was born from a passion for creating extraordinary flavors and pushing the boundaries
                of what fried chicken can be. Our dedication to perfection led to the development of our signature
                recipes that would make every meal exceptional.
              </p>
              <p className="text-gray-400 text-base sm:text-lg">
                Today, we bring that same dedication to every piece of chicken we serve, using our signature 13-spice
                blend and 24-hour marination process to ensure each bite is a taste of freedom.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative order-first md:order-last"
            >
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img
                  src="/placeholder.svg?height=600&width=600"
                  alt="Our Story"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-black relative overflow-hidden">
        <div className="absolute inset-0 prison-bars opacity-10 pointer-events-none" />
        <div className="absolute inset-0 noise pointer-events-none" />

        <div className="container px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-orange-500/10 rounded-xl p-4 sm:p-6 text-center"
            >
              <Star className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">13</div>
              <div className="text-sm sm:text-base text-gray-400">Secret Spices</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-orange-500/10 rounded-xl p-4 sm:p-6 text-center"
            >
              <Users className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">1000+</div>
              <div className="text-sm sm:text-base text-gray-400">Happy Customers</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-orange-500/10 rounded-xl p-4 sm:p-6 text-center"
            >
              <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">24HR</div>
              <div className="text-sm sm:text-base text-gray-400">Marination</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-orange-500/10 rounded-xl p-4 sm:p-6 text-center"
            >
              <ChefHat className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">15+</div>
              <div className="text-sm sm:text-base text-gray-400">Signature Dishes</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 prison-bars opacity-10 pointer-events-none" />
        <div className="absolute inset-0 noise pointer-events-none" />

        <div className="container px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 mb-4">
              Our Values
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              What Sets Us
              <span className="text-orange-500 ml-3">Apart</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Quality Without Compromise",
                description:
                  "We use only the freshest ingredients and premium chicken, prepared daily with our signature recipes.",
                delay: 0,
              },
              {
                title: "Innovation in Flavor",
                description: "Our unique spice blends and cooking techniques create unforgettable taste experiences.",
                delay: 0.1,
              },
              {
                title: "Community First",
                description:
                  "We're proud to be part of the Kelowna community and strive to give back whenever possible.",
                delay: 0.2,
              },
              {
                title: "Sustainable Practices",
                description:
                  "We're committed to environmentally responsible practices in all aspects of our operation.",
                delay: 0.3,
              },
              {
                title: "Customer Satisfaction",
                description:
                  "Your satisfaction is our top priority. We guarantee every meal will meet our high standards.",
                delay: 0.4,
              },
              {
                title: "Team Excellence",
                description:
                  "Our team is trained to provide exceptional service and maintain the highest quality standards.",
                delay: 0.5,
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: value.delay }}
                className="bg-black/50 rounded-xl p-6 border border-orange-500/20"
              >
                <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-black relative overflow-hidden">
        <div className="absolute inset-0 prison-bars opacity-10 pointer-events-none" />
        <div className="absolute inset-0 noise pointer-events-none" />

        <div className="container px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Experience
              <span className="text-orange-500 block mt-2">Legendary Flavor?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Join us at Alcatraz Chicken and discover why our chicken is Kelowna's most wanted.
            </p>
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => window.open("https://alcatrazchicken.order-online.ai/#/", "_blank")}
            >
              Order Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  )
}
