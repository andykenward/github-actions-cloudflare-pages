/* eslint-disable unicorn/no-null */

import type {Project} from '@cloudflare/types'

export const PROJECT_RESPONSE_OK = {
  id: '51dd62e5-fe5b-43aa-92c2-b1d4306e3c2c',
  name: 'mock-project-name',
  subdomain: 'mock-project-name.pages.dev',
  domains: ['mock-project-name.pages.dev', 'unlike.dev'],
  source: {
    type: 'github',
    config: {
      owner: 'unlike-ltd',
      repo_name: 'unlike.dev',
      production_branch: 'main',
      pr_comments_enabled: true,
      deployments_enabled: true,
      production_deployments_enabled: false,
      preview_deployment_setting: 'none',
      preview_branch_includes: ['*'],
      preview_branch_excludes: []
    }
  },
  build_config: {
    build_command: 'npm run build',
    destination_dir: 'dist',
    root_dir: ''
  },
  deployment_configs: {
    preview: {
      // fail_open: true,
      always_use_latest_compatibility_date: false,
      compatibility_date: '2023-04-05',
      compatibility_flags: [],
      build_image_major_version: 1,
      usage_model: 'bundled'
    },
    production: {
      // fail_open: true,
      always_use_latest_compatibility_date: false,
      compatibility_date: '2023-04-05',
      compatibility_flags: [],
      build_image_major_version: 1,
      usage_model: 'bundled'
    }
  },
  latest_deployment: {
    id: '74192c6c-9f02-4024-b8ca-23d54d3187bd',
    short_id: '74192c6c',
    project_id: '51dd62e5-fe5b-43aa-92c2-b1d4306e3c2c',
    project_name: 'mock-project-name',
    environment: 'production',
    url: 'https://74192c6c.mock-project-name.pages.dev',
    created_on: '2023-05-28T16:28:34.464716Z',
    modified_on: '2023-05-28T16:28:36.069509Z',
    latest_stage: {
      name: 'deploy',
      started_on: null,
      ended_on: '2023-05-28T16:28:36.069509Z',
      status: 'success'
    },
    deployment_trigger: {
      type: 'ad_hoc',
      metadata: {
        branch: 'main',
        commit_hash: 'af61c7610cd122d89970fc4ba4fd89dbf38eaa18',
        commit_message: 'chore: tsconfig exclude'
        // commit_dirty: false
      }
    },
    stages: [
      {
        name: 'queued',
        started_on: '2023-05-28T16:28:34.464716Z',
        ended_on: null,
        status: 'active'
      },
      {
        name: 'initialize',
        started_on: null,
        ended_on: null,
        status: 'idle'
      },
      {
        name: 'clone_repo',
        started_on: null,
        ended_on: null,
        status: 'idle'
      },
      {
        name: 'build',
        started_on: null,
        ended_on: null,
        status: 'idle'
      },
      {
        name: 'deploy',
        started_on: null,
        ended_on: '2023-05-28T16:28:36.069509Z',
        status: 'success'
      }
    ],
    build_config: {
      build_command: 'npm run build',
      destination_dir: 'dist',
      root_dir: ''
    },
    source: {
      type: 'github',
      config: {
        owner: 'unlike-ltd',
        repo_name: 'unlike.dev',
        production_branch: 'main',
        pr_comments_enabled: false
      }
    },
    env_vars: {},
    build_image_major_version: 1,
    aliases: ['https://unlike.dev'],
    is_skipped: false,
    production_branch: 'main'
  },
  canonical_deployment: {
    id: '74192c6c-9f02-4024-b8ca-23d54d3187bd',
    short_id: '74192c6c',
    project_id: '51dd62e5-fe5b-43aa-92c2-b1d4306e3c2c',
    project_name: 'mock-project-name',
    environment: 'production',
    url: 'https://74192c6c.mock-project-name.pages.dev',
    created_on: '2023-05-28T16:28:34.464716Z',
    modified_on: '2023-05-28T16:28:36.069509Z',
    latest_stage: {
      name: 'deploy',
      started_on: null,
      ended_on: '2023-05-28T16:28:36.069509Z',
      status: 'success'
    },
    deployment_trigger: {
      type: 'ad_hoc',
      metadata: {
        branch: 'main',
        commit_hash: 'af61c7610cd122d89970fc4ba4fd89dbf38eaa18',
        commit_message: 'chore: tsconfig exclude'
        // commit_dirty: false
      }
    },
    stages: [
      {
        name: 'queued',
        started_on: '2023-05-28T16:28:34.464716Z',
        ended_on: null,
        status: 'active'
      },
      {
        name: 'initialize',
        started_on: null,
        ended_on: null,
        status: 'idle'
      },
      {
        name: 'clone_repo',
        started_on: null,
        ended_on: null,
        status: 'idle'
      },
      {
        name: 'build',
        started_on: null,
        ended_on: null,
        status: 'idle'
      },
      {
        name: 'deploy',
        started_on: null,
        ended_on: '2023-05-28T16:28:36.069509Z',
        status: 'success'
      }
    ],
    build_config: {
      build_command: 'npm run build',
      destination_dir: 'dist',
      root_dir: ''
    },
    source: {
      type: 'github',
      config: {
        owner: 'unlike-ltd',
        repo_name: 'unlike.dev',
        production_branch: 'main',
        pr_comments_enabled: false
      }
    },
    env_vars: {},
    build_image_major_version: 1,
    aliases: ['https://unlike.dev'],
    is_skipped: false,
    production_branch: 'main'
  },
  created_on: '2023-04-05T14:04:31.740466Z',
  production_branch: 'main',
  production_script_name: 'pages-worker--977947-production',
  preview_script_name: 'pages-worker--977947-preview'
} satisfies Project
