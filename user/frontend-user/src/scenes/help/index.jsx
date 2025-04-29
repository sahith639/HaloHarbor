// src/scenes/help/index.jsx

import React from 'react';

const HelpPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 p-6 text-white">
      <div className="max-w-4xl mx-auto bg-white text-gray-900 rounded-2xl shadow-xl p-8 sm:p-12">
        <h1 className="text-4xl font-bold mb-4">❓ Help / About</h1>
        <p className="mb-6 text-sm text-gray-600">Here you'll find useful information and resources.</p>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">📘 About This Application</h2>
            <p>This app allows users to manage their data, share with service providers, and view activity logs using a clean, modern interface built with React, Tailwind CSS, and MUI.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">💡 Frequently Asked Questions</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>How do I share my data?</strong> – Use the "Connections" tab to link with service providers.</li>
              <li><strong>How is my data secured?</strong> – All data is encrypted and access is token-protected.</li>
              <li><strong>How do I logout?</strong> – Click the logout icon at the bottom of the sidebar.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">📬 Contact Support</h2>
            <p>For questions or feedback, email us at <a href="mailto:support@yourapp.com" className="text-blue-600 font-medium underline">support@yourapp.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">🛠️ Version Info</h2>
            <p>App Version: <strong>v1.0.0</strong></p>
            <p>Last Updated: <strong>April 2025</strong></p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
