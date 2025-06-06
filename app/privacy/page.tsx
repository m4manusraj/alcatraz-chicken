import { Layout } from "@/components/layout"

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none">
          <p>
            This Privacy Policy describes how Alcatraz Chicken ("we", "our", or "us") collects, uses, and shares your
            personal information when you visit our website, use our services, or interact with us.
          </p>

          <h2>Information We Collect</h2>
          <p>
            We collect information that you provide directly to us, such as when you create an account, place an order,
            contact customer service, or otherwise interact with us. This information may include your name, email
            address, phone number, delivery address, and payment information.
          </p>

          <h2>How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, process transactions, send
            you related information including confirmations, receipts, and customer experience surveys, and communicate
            with you about products, services, offers, and promotions.
          </p>

          <h2>Sharing Your Information</h2>
          <p>
            We may share your personal information with service providers who perform services on our behalf, such as
            payment processing, data analysis, email delivery, and other services.
          </p>

          <h2>Your Choices</h2>
          <p>
            You can opt out of receiving promotional communications from us by following the instructions in those
            communications. You may also update, correct, or delete your account information at any time by contacting
            us.
          </p>

          <h2>Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at info@alcatrazchicken.ca.</p>
        </div>
      </div>
    </Layout>
  )
}
