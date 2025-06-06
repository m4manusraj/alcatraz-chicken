import { Layout } from "@/components/layout"

export default function TermsPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none">
          <p>
            These Terms of Service ("Terms") govern your access to and use of the services provided by Alcatraz Chicken
            ("we", "our", or "us"), including our website, mobile applications, and other online services (collectively,
            the "Services").
          </p>

          <h2>Using Our Services</h2>
          <p>
            You must follow any policies made available to you within the Services. You may use our Services only as
            permitted by law. We may suspend or stop providing our Services to you if you do not comply with our terms
            or policies or if we are investigating suspected misconduct.
          </p>

          <h2>Your Alcatraz Chicken Account</h2>
          <p>
            You may need an account to use some of our Services. You are responsible for maintaining the confidentiality
            of your account credentials and for all activities that occur under your account.
          </p>

          <h2>Privacy and Copyright Protection</h2>
          <p>
            Our privacy policy explains how we treat your personal data and protect your privacy when you use our
            Services. By using our Services, you agree that we can use such data in accordance with our privacy policy.
          </p>

          <h2>Modifying and Terminating our Services</h2>
          <p>
            We are constantly changing and improving our Services. We may add or remove functionalities or features, and
            we may suspend or stop a Service altogether.
          </p>

          <h2>Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at info@alcatrazchicken.ca.</p>
        </div>
      </div>
    </Layout>
  )
}
