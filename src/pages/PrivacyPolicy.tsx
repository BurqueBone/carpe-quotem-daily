import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8 md:p-12 shadow-elegant border-muted/20">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-4xl font-bold text-foreground mb-8 text-center">Privacy Policy</h1>
            
            <div className="space-y-6 text-foreground/90">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Privacy Policy for Sunday4k</h2>
                <p className="text-sm text-muted-foreground mb-6"><strong>Effective Date:</strong> September 15, 2025</p>
                
                <p className="leading-relaxed mb-4">
                  This Privacy Policy describes how Sunday4k ("the App," "we," "us," or "our") collects, uses, and discloses information from users of our mobile application. We are committed to protecting your privacy and providing a transparent and secure experience. This policy applies to all users of the Sunday4k application and outlines our practices in compliance with global data protection laws, including the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and the Personal Information Protection and Electronic Documents Act (PIPEDA).
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">1. The Information We Collect</h2>
                <p className="leading-relaxed mb-4">
                  Sunday4k is designed to promote positive personal growth with minimal data collection. When you use our App, we collect the following limited types of personal data to provide our core services.
                </p>
                <p className="leading-relaxed mb-4">
                  <strong>Email Address:</strong> Used for user authentication and to send daily customizable quote notifications.
                </p>
                <p className="leading-relaxed mb-4">
                  <strong>Birthdate:</strong> Provided by you to allow us to calculate and display the number of Sundays you have experienced, a core feature of the App.
                </p>
                <p className="leading-relaxed mb-4">
                  In addition to this, we collect non-personal data automatically as you use the App. This includes device information (such as device type and operating system) and usage data (such as viewed quotes and clicked resource links). This helps us understand how the App is used, allowing us to improve its functionality.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">2. The Purposes for Which We Use Your Information and Our Legal Basis</h2>
                <p className="leading-relaxed mb-4">
                  We use the information we collect to provide and improve the Sunday4k experience. Our legal basis for processing your data is as follows:
                </p>
                <p className="leading-relaxed mb-4">
                  <strong>Performance of a Contract:</strong> We process your email address to create and manage your user account and to deliver the daily quote notifications you have subscribed to. This processing is necessary to fulfill the service agreement we have with you.
                </p>
                <p className="leading-relaxed mb-4">
                  <strong>Legitimate Interests:</strong> We process your birthdate solely to provide the "Sundays lived" count. This processing is based on our legitimate interest in providing a core, non-essential feature that you have specifically requested. We also use aggregated, non-personal usage data to analyze App performance and develop future features. This helps us maintain and improve our services without using personal data.
                </p>
                <p className="leading-relaxed mb-4">
                  <strong>Consent:</strong> For any future data processing that does not fall under the above categories, we will seek your explicit consent beforehand.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">3. Data Sharing and Disclosure</h2>
                <p className="leading-relaxed mb-4">
                  We do not sell, rent, or trade your personal information. We only share information with third-party service providers who assist us in operating our App. These providers are carefully selected and are bound by contractual agreements that require them to maintain the same level of data protection that we do. The categories of third-party providers we use include:
                </p>
                <p className="leading-relaxed mb-4">
                  <strong>Cloud Hosting Providers:</strong> To securely store and host our application data.
                </p>
                <p className="leading-relaxed mb-4">
                  <strong>Analytics Services:</strong> To analyze App usage and improve features.
                </p>
                <p className="leading-relaxed mb-4">
                  <strong>Affiliate Networks:</strong> To track commissions from clicks on affiliate marketing links within the App. This involves the use of tracking technologies, such as cookies, which may be placed on your device to identify that you were referred from Sunday4k.
                </p>
                <p className="leading-relaxed mb-4">
                  <strong>Affiliate Marketing and Cookies:</strong> When you click on an affiliate link, a third-party cookie may be placed on your device. This cookie is used exclusively for commission tracking and does not collect any of your personal information. We will obtain your explicit consent for the use of any non-essential cookies.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">4. Data Security and International Data Transfers</h2>
                <p className="leading-relaxed mb-4">
                  The security of your information is our priority. We employ a combination of administrative, technical, and physical safeguards to protect your data. All data transmitted between your device and our servers is secured using Transport Layer Security (TLS) encryption. Data stored on our servers is protected using industry-standard security practices, including cryptographic methods to prevent unauthorized access. We regularly review and update our security measures.
                </p>
                <p className="leading-relaxed mb-4">
                  As a global service, Sunday4k may transfer and store your data on servers located outside of your country of residence. When we transfer your data internationally, we ensure it receives an adequate level of protection in compliance with laws like the GDPR. We do this by implementing legally approved transfer mechanisms, such as Standard Contractual Clauses (SCCs), to guarantee the security and privacy of your data.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">5. Your Privacy Rights</h2>
                <p className="leading-relaxed mb-4">
                  Depending on your jurisdiction, you have specific rights concerning your personal information, which we are committed to upholding. You can exercise these rights at any time by contacting us. We will respond to all requests within 45 days, as required by law.
                </p>
                <p className="leading-relaxed mb-4">
                  <strong>Right to Know:</strong> You can request to know what personal information we have collected about you, the sources from which it was collected, the purposes for its use, and with whom it has been shared.
                </p>
                <p className="leading-relaxed mb-4">
                  <strong>Right to Access:</strong> You can request a copy of the personal data we hold about you.
                </p>
                <p className="leading-relaxed mb-4">
                  <strong>Right to Rectification:</strong> You can request that we correct any inaccurate or incomplete personal information.
                </p>
                <p className="leading-relaxed mb-4">
                  <strong>Right to Erasure ("Right to be Forgotten"):</strong> You have the right to request the deletion of your personal data. You can delete your account directly within the App, and we will delete your personal information within 30 days of your request. We may retain certain data for a longer period if required by law or for a legitimate business purpose, such as resolving disputes or for tax compliance.
                </p>
                <p className="leading-relaxed mb-4">
                  <strong>Right to Data Portability:</strong> You have the right to request your personal data in a structured, commonly used, and machine-readable format.
                </p>
                <p className="leading-relaxed mb-4">
                  <strong>Right to Object:</strong> You have the right to object to our processing of your personal data under certain circumstances.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">6. Data Retention Policy</h2>
                <p className="leading-relaxed mb-4">
                  We will retain your personal data only for as long as necessary to provide you with our services and fulfill the purposes outlined in this policy. Once you delete your account, we will delete your personal data within 30 days. We may retain non-personal, aggregated, or anonymized data for a longer period for analytical purposes, as this data can no longer be used to identify you personally.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">7. Children's Privacy</h2>
                <p className="leading-relaxed mb-4">
                  Sunday4k is not directed to individuals under the age of 16. We do not knowingly collect personal information from children under 16. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us immediately. If we become aware that we have collected personal data from a child under 16, or a child under 13 in the U.S. in compliance with the Children's Online Privacy Protection Act (COPPA), we will take steps to remove that information from our servers.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">8. Changes to This Privacy Policy</h2>
                <p className="leading-relaxed mb-4">
                  We may update this Privacy Policy from time to time. When we make significant changes, we will notify you by posting a prominent notice within the App or by other appropriate means. Your continued use of the App after any such changes signifies your acceptance of the updated policy. We encourage you to review this Privacy Policy periodically.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">9. Contact Us</h2>
                <p className="leading-relaxed mb-4">
                  If you have any questions or concerns about this Privacy Policy or our data practices, or if you wish to exercise your data rights, please contact us at: <a href="mailto:info@sunday4k.life" className="text-primary hover:underline">info@sunday4k.life</a>
                </p>
              </div>
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;