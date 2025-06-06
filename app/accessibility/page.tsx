import { Layout } from "@/components/layout"

export default function AccessibilityPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Accessibility Statement</h1>
        <div className="prose prose-invert max-w-none">
          <p>
            Alcatraz Chicken is committed to ensuring digital accessibility for people with disabilities. We are
            continually improving the user experience for everyone, and applying the relevant accessibility standards.
          </p>

          <h2>Measures to Support Accessibility</h2>
          <p>Alcatraz Chicken takes the following measures to ensure accessibility of our website:</p>
          <ul>
            <li>Include accessibility as part of our mission statement</li>
            <li>Integrate accessibility into our procurement practices</li>
            <li>Provide continual accessibility training for our staff</li>
            <li>Assign clear accessibility targets and responsibilities</li>
          </ul>

          <h2>Conformance Status</h2>
          <p>
            The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve
            accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and
            Level AAA. Alcatraz Chicken's website is partially conformant with WCAG 2.1 level AA.
          </p>

          <h2>Feedback</h2>
          <p>
            We welcome your feedback on the accessibility of our website. Please let us know if you encounter
            accessibility barriers:
          </p>
          <ul>
            <li>Phone: (250) 980-6991</li>
            <li>E-mail: info@alcatrazchicken.ca</li>
            <li>Postal address: 101-225 Rutland Rd S, Kelowna, BC, Canada</li>
          </ul>

          <h2>Compatibility with Browsers and Assistive Technology</h2>
          <p>Alcatraz Chicken's website is designed to be compatible with the following assistive technologies:</p>
          <ul>
            <li>Screen readers</li>
            <li>Screen magnifiers</li>
            <li>Voice recognition software</li>
            <li>Keyboard-only navigation</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}
