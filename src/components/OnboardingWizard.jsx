import { useState } from 'react';
import useOnboardingFormStore from '../store/onboardingFormStore';

const STEP_LABELS = ['Overview', 'Organization', 'Target System', 'Security & Access', 'Mission Apps', 'Dependencies', 'Review & Download', 'Upload to DMZ'];

const STEP_SUBTITLES = [
  "What you'll need",
  'Point of contact',
  'Architecture & hardware',
  'GUI, PW, session',
  'Included software',
  'SBOM inputs',
  'Edit & generate JSON',
  'SFTP instructions'
];

const MISSION_APP_OPTIONS = [
  '0183-parser',
  '0183-producer',
  'CoT-parser',
  'doodle-interface',
  'HORUS-interface',
  'moos-interface',
  'Northrop Grumman Scion',
  'scion-parser',
  'TAK',
  'tak-interface',
  'tak-server',
  'Tempest Messaging Service (Core)'
];

// One-off browser download trigger. This creates a temporary, invisible <a> tag,
// clicks it programmatically, then removes it — it's not part of anything React
// renders/tracks, so it doesn't conflict with React's usual DOM management.
function downloadJson(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const ToggleField = ({ label, hint, value, onChange }) => (
  <div>
    <label className="block font-semibold mb-1">{label}</label>
    <p className="text-xs text-gray-500 mb-2">{hint}</p>
    <div className="flex gap-2">
      <button
        onClick={() => onChange(true)}
        className={`px-4 py-2 rounded font-semibold ${value ? 'bg-lime-brand text-black' : 'bg-gray-800 border border-gray-600 text-gray-300'}`}
      >
        Yes
      </button>
      <button
        onClick={() => onChange(false)}
        className={`px-4 py-2 rounded font-semibold ${!value ? 'bg-lime-brand text-black' : 'bg-gray-800 border border-gray-600 text-gray-300'}`}
      >
        No
      </button>
    </div>
  </div>
);

// Left sidebar — lists every step with its subtitle, highlights the current one,
// and lets you jump directly to any step by clicking it (no validation gating,
// same free-navigation behavior we've had via Back/Continue).
const WizardSidebar = ({ currentStep, onJump }) => (
  <nav className="w-56 flex-shrink-0">
    <div className="text-xs uppercase tracking-wide text-gray-500 mb-3">Customer Intake</div>
    <div className="space-y-1">
      {STEP_LABELS.map((label, i) => (
        <button
          key={label}
          onClick={() => onJump(i)}
          className={`w-full text-left flex items-start gap-3 px-2 py-2 rounded ${currentStep === i ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}
        >
          <span
            className={`flex-shrink-0 w-6 h-6 mt-0.5 rounded-full border flex items-center justify-center text-xs ${
              currentStep === i ? 'border-lime-brand text-lime-brand bg-lime-brand/10' : 'border-gray-600 text-gray-500'
            }`}
          >
            {i}
          </span>
          <span>
            <div className={`text-sm font-semibold ${currentStep === i ? 'text-white' : 'text-gray-300'}`}>{label}</div>
            <div className="text-xs text-gray-500">{STEP_SUBTITLES[i]}</div>
          </span>
        </button>
      ))}
    </div>

    <div className="pt-4 mt-4 border-t border-gray-700">
      <div className="text-xs text-gray-500 mb-1">Progress {currentStep} / {STEP_LABELS.length - 1}</div>
      <div className="h-1 bg-gray-800 rounded">
        <div
          className="h-1 bg-lime-brand rounded"
          style={{ width: `${(currentStep / (STEP_LABELS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  </nav>
);

const OnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [missionSearch, setMissionSearch] = useState('');
  const store = useOnboardingFormStore();

  const filteredApps = MISSION_APP_OPTIONS.filter((app) =>
    app.toLowerCase().includes(missionSearch.trim().toLowerCase())
  );

  return (
    <div className="flex gap-8 p-6 text-gray-200">
      <WizardSidebar currentStep={currentStep} onJump={setCurrentStep} />

      <div className="flex-1 max-w-2xl">
        <div className="mb-6 text-sm text-gray-400">
          Step {currentStep + 1} of {STEP_LABELS.length}: <span className="text-lime-brand font-semibold">{STEP_LABELS[currentStep]}</span>
        </div>

        {currentStep === 0 && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Let&apos;s set up your build pipeline</h1>
            <p className="text-gray-400">
              This form collects the information Caliburn needs to stand up a build pipeline for your project.
              At the end, you&apos;ll download two JSON files and get step-by-step instructions for uploading everything
              to the Caliburn Partner DMZ over SFTP.
            </p>
            <div className="border border-gray-700 rounded p-4">
              <h3 className="font-semibold mb-2">What you&apos;ll need on hand</h3>
              <ul className="list-disc list-inside text-gray-400 space-y-1">
                <li>Your organization / project contact details</li>
                <li>Target hardware and architecture details for your deployment</li>
                <li>A list of third-party software dependencies (name, version, checksum) bundled in your release</li>
                <li>The ability to generate a SHA-256 checksum for your compiled software artifact</li>
              </ul>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Organization &amp; Point of Contact</h1>

            <div>
              <label className="block mb-1 font-semibold">Organization Name *</label>
              <input
                type="text"
                value={store.organization}
                onChange={(e) => store.setField('organization', e.target.value)}
                placeholder="e.g. Acme Industries"
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Customer ID (auto-generated): {store.customerId() || '-'}</p>
            </div>

            <div>
              <label className="block mb-1 font-semibold">Project Name *</label>
              <input
                type="text"
                value={store.project}
                onChange={(e) => store.setField('project', e.target.value)}
                placeholder="e.g. percival"
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-100"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Point of Contact Email *</label>
              <input
                type="email"
                value={store.poc_email}
                onChange={(e) => store.setField('poc_email', e.target.value)}
                placeholder="e.g. ops@example.com"
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-100"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Target System</h1>
            <p className="text-gray-400">What hardware/architecture is this build targeting?</p>

            <div>
              <label className="block mb-1 font-semibold">Architecture *</label>
              <select
                value={store.architecture}
                onChange={(e) => store.setField('architecture', e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-100"
              >
                <option value="">Select...</option>
                <option value="arm64">arm64</option>
                <option value="amd64">amd64</option>
                <option value="other">Other</option>
              </select>
              {store.architecture === 'other' && (
                <input
                  type="text"
                  value={store.architecture_other}
                  onChange={(e) => store.setField('architecture_other', e.target.value)}
                  placeholder="Specify architecture"
                  className="w-full mt-2 px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-100"
                />
              )}
            </div>

            <div>
              <label className="block mb-1 font-semibold">Image Format *</label>
              <select
                value={store.image_format}
                onChange={(e) => store.setField('image_format', e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-100"
              >
                <option value="">Select...</option>
                <option value="iso">ISO</option>
                <option value="qcow2">QCOW2</option>
                <option value="raw">RAW (.raw / .img)</option>
                <option value="other">Other</option>
              </select>
              {store.image_format === 'other' && (
                <input
                  type="text"
                  value={store.image_format_other}
                  onChange={(e) => store.setField('image_format_other', e.target.value)}
                  placeholder="Specify image format"
                  className="w-full mt-2 px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-100"
                />
              )}
            </div>

            <div>
              <label className="block mb-1 font-semibold">Target Hardware / Platform *</label>
              <input
                type="text"
                value={store.target}
                onChange={(e) => store.setField('target', e.target.value)}
                placeholder="e.g. MitySOM-AM62Px"
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-100"
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Security &amp; Access Configuration</h1>
            <p className="text-gray-400">A few yes/no questions about the deployed system.</p>

            <ToggleField
              label="Should this build include a GUI?"
              hint="Whether the deployed system should boot into a graphical desktop/interface, or run headless (console/CLI only)."
              value={store.gui}
              onChange={(val) => store.setField('gui', val)}
            />
            <ToggleField
              label="Enforce password complexity requirements?"
              hint="Whether the system should require strong passwords (length, character mix) for local accounts."
              value={store.password_complexity}
              onChange={(val) => store.setField('password_complexity', val)}
            />
            <ToggleField
              label="Enforce session timeout?"
              hint="Whether user sessions should automatically lock or log out after a period of inactivity."
              value={store.session_timeout}
              onChange={(val) => store.setField('session_timeout', val)}
            />
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Mission Applications</h1>
            <p className="text-gray-400">Select every mission/application software component that should be included on this system.</p>

            <div className="flex gap-2">
              <input
                type="text"
                value={missionSearch}
                onChange={(e) => setMissionSearch(e.target.value)}
                placeholder='Search apps (e.g. "0183", "tak", "scion")'
                className="flex-1 px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-100"
              />
              <button
                onClick={() => store.addMissionApps(filteredApps)}
                className="px-4 py-2 rounded bg-lime-brand text-black font-semibold whitespace-nowrap"
              >
                Select matching
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto border border-gray-700 rounded p-2 space-y-1">
              {filteredApps.map((app) => (
                <label key={app} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-800 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={store.mission_apps.includes(app)}
                    onChange={() => store.toggleMissionApp(app)}
                  />
                  <span>{app}</span>
                </label>
              ))}
            </div>

            <div>
              <h2 className="font-semibold mb-2">Selected</h2>
              <ul className="flex flex-wrap gap-2">
                {store.mission_apps.map((app) => (
                  <li key={app} className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 border border-gray-600 text-sm">
                    {app}
                    <button onClick={() => store.toggleMissionApp(app)} className="text-gray-400 hover:text-white">✕</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Software Dependencies</h1>
            <p className="text-gray-400">
              List every third-party, open-source tool or package your custom software needs present on the system.
              This becomes your Customer-Software-Dependencies.json file.
            </p>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={store.no_dependencies}
                onChange={(e) => store.setField('no_dependencies', e.target.checked)}
              />
              No third-party dependencies to declare for this release
            </label>

            {!store.no_dependencies && (
              <>
                <div className="space-y-6">
                  {store.dependencies.map((dep, i) => (
                    <div key={i} className="border border-gray-700 rounded p-4 space-y-3 relative">
                      <button
                        onClick={() => store.removeDependency(i)}
                        className="absolute top-3 right-3 text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold mb-1">Name *</label>
                          <input
                            type="text"
                            value={dep.name}
                            onChange={(e) => store.updateDependency(i, 'name', e.target.value)}
                            placeholder="e.g. node-exporter"
                            className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1">Version *</label>
                          <input
                            type="text"
                            value={dep.version}
                            onChange={(e) => store.updateDependency(i, 'version', e.target.value)}
                            placeholder="e.g. 1.8.0"
                            className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1">Architecture</label>
                          <select
                            value={dep.architecture}
                            onChange={(e) => store.updateDependency(i, 'architecture', e.target.value)}
                            className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-100"
                          >
                            <option value="">Select...</option>
                            <option value="arm64">arm64</option>
                            <option value="amd64">amd64</option>
                            <option value="other">other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1">SHA-256 Checksum *</label>
                          <input
                            type="text"
                            value={dep.checksum_sha256}
                            onChange={(e) => store.updateDependency(i, 'checksum_sha256', e.target.value)}
                            placeholder="64-character hex string"
                            className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-100"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-1">Source</label>
                        <div className="flex gap-4 mb-2 text-sm">
                          <label className="flex items-center gap-1">
                            <input
                              type="radio"
                              checked={dep.source_type !== 'registry'}
                              onChange={() => store.updateDependency(i, 'source_type', 'source_url')}
                            />
                            Source URL
                          </label>
                          <label className="flex items-center gap-1">
                            <input
                              type="radio"
                              checked={dep.source_type === 'registry'}
                              onChange={() => store.updateDependency(i, 'source_type', 'registry')}
                            />
                            Container Registry
                          </label>
                        </div>
                        <input
                          type="text"
                          value={dep.source_value}
                          onChange={(e) => store.updateDependency(i, 'source_value', e.target.value)}
                          placeholder={dep.source_type === 'registry' ? 'e.g. docker.io/prometheus/alertmanager' : 'e.g. github.com/prometheus/node_exporter'}
                          className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-100"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => store.addDependency()}
                  className="px-4 py-2 rounded border border-gray-600 text-gray-300"
                >
                  + Add Dependency
                </button>
              </>
            )}
          </div>
        )}

        {currentStep === 6 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Review &amp; Download</h1>
            <p className="text-gray-400">Review everything below, then download both files for the DMZ upload.</p>

            <div className="border border-gray-700 rounded p-4 space-y-1 text-sm">
              <h3 className="font-semibold mb-2">Organization &amp; Contact</h3>
              <p><span className="text-gray-500">Organization:</span> {store.organization || '-'}</p>
              <p><span className="text-gray-500">Project:</span> {store.project || '-'}</p>
              <p><span className="text-gray-500">POC Email:</span> {store.poc_email || '-'}</p>
              <p><span className="text-gray-500">Customer ID:</span> {store.customerId() || '-'}</p>
              <p><span className="text-gray-500">Release ID:</span> {store.releaseId()}</p>
            </div>

            <div className="border border-gray-700 rounded p-4 space-y-1 text-sm">
              <h3 className="font-semibold mb-2">Target System</h3>
              <p><span className="text-gray-500">Architecture:</span> {(store.architecture === 'other' ? store.architecture_other : store.architecture) || '-'}</p>
              <p><span className="text-gray-500">Image Format:</span> {(store.image_format === 'other' ? store.image_format_other : store.image_format) || '-'}</p>
              <p><span className="text-gray-500">Target Hardware:</span> {store.target || '-'}</p>
              <p><span className="text-gray-500">Hostname:</span> {store.hostname()}</p>
            </div>

            <div className="border border-gray-700 rounded p-4 space-y-1 text-sm">
              <h3 className="font-semibold mb-2">Security &amp; Access</h3>
              <p><span className="text-gray-500">GUI:</span> {store.gui ? 'Yes' : 'No'}</p>
              <p><span className="text-gray-500">Password complexity:</span> {store.password_complexity ? 'Yes' : 'No'}</p>
              <p><span className="text-gray-500">Session timeout:</span> {store.session_timeout ? 'Yes' : 'No'}</p>
            </div>

            <div className="border border-gray-700 rounded p-4 space-y-1 text-sm">
              <h3 className="font-semibold mb-2">Mission Applications</h3>
              {store.mission_apps.length === 0 ? (
                <p className="text-gray-500">None selected</p>
              ) : (
                <p>{store.mission_apps.join(', ')}</p>
              )}
            </div>

            <div className="border border-gray-700 rounded p-4 space-y-1 text-sm">
              <h3 className="font-semibold mb-2">Software Dependencies</h3>
              {store.no_dependencies ? (
                <p className="text-gray-500">No third-party dependencies declared</p>
              ) : store.dependencies.length === 0 ? (
                <p className="text-red-400">No dependencies added (and &quot;no dependencies&quot; isn&apos;t checked — go back and fix this)</p>
              ) : (
                <ul className="list-disc list-inside">
                  {store.dependencies.map((dep, i) => (
                    <li key={i}>{dep.name || '(unnamed)'} @ {dep.version || '?'}</li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Generated Files</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Customer-Onboarding-Form.json</p>
                  <pre className="bg-gray-900 border border-gray-700 rounded p-3 text-xs overflow-auto max-h-64">
                    {JSON.stringify(store.buildOnboardingJson(), null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Customer-Software-Dependencies.json</p>
                  <pre className="bg-gray-900 border border-gray-700 rounded p-3 text-xs overflow-auto max-h-64">
                    {JSON.stringify(store.buildDependenciesJson(), null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                downloadJson('Customer-Onboarding-Form.json', store.buildOnboardingJson());
                setTimeout(() => downloadJson('Customer-Software-Dependencies.json', store.buildDependenciesJson()), 150);
              }}
              className="w-full px-4 py-3 rounded bg-lime-brand text-black font-semibold"
            >
              Download Both JSON Files
            </button>
          </div>
        )}

        {currentStep === 7 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Uploading to the Caliburn Partner DMZ</h1>
            <p className="text-gray-400">
              Caliburn&apos;s DMZ only accepts uploads over SFTP. There is no web upload and no AWS/S3 access is provided.
              Follow these steps using the SFTP credentials and SSH key registration Caliburn sends you separately.
            </p>

            <div className="border border-yellow-600/40 bg-yellow-900/10 rounded p-4 text-sm">
              <strong>Before you start:</strong> Caliburn must send you an SFTP hostname, username, and register your SSH public key before you can connect. If you haven&apos;t received these yet, contact your Caliburn representative.
            </div>

            <div>
              <h3 className="font-semibold mb-2">1. Generate an SSH key pair</h3>
              <p className="text-sm text-gray-400 mb-1">Skip if you already have one registered with Caliburn.</p>
              <p className="text-sm text-gray-400 mb-2">Keep your private SSH key protected. Only share the PUBLIC key with Caliburn.</p>
              <pre className="bg-gray-900 border border-gray-700 rounded p-3 text-xs overflow-auto">
{`ssh-keygen -t rsa -b 3072 -f ~/.ssh/caliburn_cprt_sftp -C "$(whoami)-cprt-upload"
chmod 600 ~/.ssh/caliburn_cprt_sftp
cat ~/.ssh/caliburn_cprt_sftp.pub   # send this PUBLIC key to Caliburn, never the private key`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Prepare your workload.tar.gz</h3>
              <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                <li>Your &quot;workload&quot; must be a tarballed, gzipped folder of your custom software with the .tar.gz extension</li>
                <li>The .tar.gz file may contain source files, binaries, and/or container images in .tar format</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Generate the checksum</h3>
              <p className="text-sm text-gray-400 mb-2">For your compiled software artifact, saved as customer-workload.tar.gz.</p>
              <pre className="bg-gray-900 border border-gray-700 rounded p-3 text-xs overflow-auto">
                sha256sum customer-workload.tar.gz &gt; customer-workload.tar.gz.sha256
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4. Connect and upload</h3>
              <p className="text-sm text-gray-400 mb-2">Upload the .tar.gz <u>last</u>. It triggers scanning/validation, and every other file must already be present or the scan will fail.</p>
              <table className="w-full text-sm border border-gray-700">
                <thead>
                  <tr className="border-b border-gray-700 text-left">
                    <th className="p-2">File</th>
                    <th className="p-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800"><td className="p-2">Customer-Onboarding-Form.json</td><td className="p-2 text-gray-400">Downloaded in the previous step</td></tr>
                  <tr className="border-b border-gray-800"><td className="p-2">Customer-Software-Dependencies.json</td><td className="p-2 text-gray-400">Downloaded in the previous step</td></tr>
                  <tr className="border-b border-gray-800"><td className="p-2">customer-workload.tar.gz.sha256</td><td className="p-2 text-gray-400">Checksum of your compiled software artifact</td></tr>
                  <tr className="border-b border-gray-800"><td className="p-2">optional-sbom.cdx.json</td><td className="p-2 text-gray-400">SBOM, CycloneDX 1.4 JSON (recommended)</td></tr>
                  <tr><td className="p-2">customer-workload.tar.gz</td><td className="p-2 text-gray-400">Your compiled software artifact. Upload this last.</td></tr>
                </tbody>
              </table>

              <div className="border border-lime-brand/30 bg-lime-brand/5 rounded p-3 text-sm mt-3">
                Uploading more than one release today? Add a version suffix to the folder name to keep each one unique, e.g. <code>{store.releaseId()}-v1</code>.
              </div>

              <pre className="bg-gray-900 border border-gray-700 rounded p-3 text-xs overflow-auto mt-3">
{`sftp -i ~/.ssh/caliburn_cprt_sftp <username>@sftp.avalon.services

# at the sftp> prompt:
mkdir ${store.releaseId()}
cd ${store.releaseId()}
put Customer-Onboarding-Form.json
put Customer-Software-Dependencies.json
put customer-workload.tar.gz.sha256
put optional-sbom.cdx.json
put customer-workload.tar.gz
ls -lh
bye`}
              </pre>
            </div>

            <div className="border border-green-600/40 bg-green-900/10 rounded p-4 text-sm">
              <strong>Verify:</strong> confirm all files appear in the ls -lh output, then notify your Caliburn support contact that <code>{store.releaseId()}</code> is ready for review. Allow up to 24 hours for automated scanning and validation.
            </div>

            <div className="border border-gray-700 rounded p-4 text-sm">
              <strong>Restrictions to keep in mind:</strong>
              <ul className="list-disc list-inside text-gray-400 space-y-1 mt-2">
                <li>SFTP is the only supported interface, no AWS account or S3 credentials are provided</li>
                <li>Never email software artifacts, use SFTP only</li>
                <li>Use SFTP, not SCP (SCP is not supported)</li>
                <li>Always upload a checksum alongside every artifact</li>
                <li>You only have access to your assigned home directory/prefix</li>
              </ul>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          <button
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            className="px-4 py-2 rounded border border-gray-600 text-gray-300"
          >
            Back
          </button>
          {currentStep === STEP_LABELS.length - 1 ? (
            <button
              onClick={() => {
                store.resetForm();
                setCurrentStep(0);
              }}
              className="px-4 py-2 rounded bg-lime-brand text-black font-semibold"
            >
              Deploy
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep((s) => Math.min(STEP_LABELS.length - 1, s + 1))}
              className="px-4 py-2 rounded bg-lime-brand text-black font-semibold"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;