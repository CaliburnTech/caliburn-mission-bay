import { create } from 'zustand';

// Ported from avalon-onboarding-main/build-pipeline/script.js — keep that file
// open side-by-side as the reference for what this is supposed to match.

const FIXED_ARTIFACT_NAME = 'customer-workload.tar.gz';

function slugify(str) {
  const slug = String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || '';
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const useOnboardingFormStore = create((set, get) => ({
  organization: '',
  project: '',
  poc_email: '',
  architecture: '',
  architecture_other: '',
  image_format: '',
  image_format_other: '',
  target: '',
  gui: false,
  password_complexity: false,
  session_timeout: false,
  mission_apps: [],
  no_dependencies: false,
  dependencies: [], // { name, version, checksum_sha256, architecture, source_type, source_value }
  release_date: todayStr(),
  release_suffix: '',

  setField: (key, value) => set({ [key]: value }),

  addDependency: () => set((s) => ({
    dependencies: [...s.dependencies, { name: '', version: '', checksum_sha256: '', architecture: '', source_type: 'source_url', source_value: '' }]
  })),
  updateDependency: (index, key, value) => set((s) => ({
    dependencies: s.dependencies.map((d, i) => (i === index ? { ...d, [key]: value } : d))
  })),
  removeDependency: (index) => set((s) => ({
    dependencies: s.dependencies.filter((_, i) => i !== index)
  })),

  toggleMissionApp: (appId) => set((s) => ({
    mission_apps: s.mission_apps.includes(appId)
      ? s.mission_apps.filter((id) => id !== appId)
      : [...s.mission_apps, appId]
  })),
  addMissionApps: (apps) => set((s) => ({
    mission_apps: Array.from(new Set([...s.mission_apps, ...apps]))
  })),

  customerId: () => slugify(get().organization),
  releaseId: () => {
    const s = get();
    const base = `release-${s.release_date || todayStr()}`;
    const suffix = s.release_suffix?.trim();
    return suffix ? `${base}-${suffix}` : base;
  },
  hostname: () => `tempestos-${get().customerId()}`,

  buildOnboardingJson: () => {
    const s = get();
    return {
      customer_id: s.customerId(),
      organization: s.organization,
      project: s.project,
      poc_email: s.poc_email,
      release_id: s.releaseId(),
      artifact: FIXED_ARTIFACT_NAME,
      architecture: s.architecture === 'other' ? s.architecture_other : s.architecture,
      image_format: s.image_format === 'other' ? s.image_format_other : s.image_format,
      target: s.target,
      gui: s.gui,
      hostname: s.hostname(),
      password_complexity: s.password_complexity,
      session_timeout: s.session_timeout,
      mission_apps: s.mission_apps
    };
  },

  buildDependenciesJson: () => {
    const s = get();
    const deps = s.no_dependencies
      ? []
      : s.dependencies.map((d) => {
          const entry = {
            name: d.name,
            version: d.version,
            checksum_sha256: d.checksum_sha256,
            architecture: d.architecture
          };
          if (d.source_type === 'registry') entry.registry = d.source_value;
          else entry.source_url = d.source_value;
          return entry;
        });
    return {
      customer_id: s.customerId(),
      release_id: s.releaseId(),
      created_at: new Date().toISOString(),
      dependencies: deps
    };
  },

  resetForm: () => set({
    organization: '', project: '', poc_email: '',
    architecture: '', architecture_other: '',
    image_format: '', image_format_other: '',
    target: '', gui: false, password_complexity: false, session_timeout: false,
    mission_apps: [], no_dependencies: false, dependencies: [],
    release_date: todayStr(), release_suffix: ''
  })
}));

export default useOnboardingFormStore;