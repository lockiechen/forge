import path from 'path';

import { MakerBase, MakerOptions } from '@electron-forge/maker-base';
import { ForgePlatform } from '@electron-forge/shared-types';
import fs from 'fs-extra';

import { MakerDMGConfig } from './Config';

export default class MakerDMG extends MakerBase<MakerDMGConfig> {
  name = 'dmg';

  defaultPlatforms: ForgePlatform[] = ['darwin', 'mas'];

  isSupportedOnCurrentPlatform(): boolean {
    return process.platform === 'darwin';
  }

  async make({ dir, makeDir, appName, packageJSON, targetArch }: MakerOptions): Promise<string[]> {
    const { createDMG } = require('electron-installer-dmg');
    const dmgName = `${this.config.name || appName}_${targetArch}`;
    const outPath = path.resolve(makeDir, `${dmgName}.dmg`);
    const forgeDefaultOutPath = path.resolve(makeDir, `${appName}-${packageJSON.version}-${targetArch}.dmg`);

    await this.ensureFile(outPath);
    const dmgConfig = {
      overwrite: true,
      ...this.config,
      name: dmgName,
      appPath: path.resolve(dir, `${appName}.app`),
      out: path.dirname(outPath),
    };
    await createDMG(dmgConfig);
    if (!this.config.name) {
      await this.ensureFile(forgeDefaultOutPath);
      await fs.rename(outPath, forgeDefaultOutPath);
      return [forgeDefaultOutPath];
    }

    return [outPath];
  }
}

export { MakerDMG, MakerDMGConfig };
