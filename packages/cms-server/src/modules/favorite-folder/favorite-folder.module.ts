import { Module } from '@nestjs/common';

import { CMSORMModule } from 'src/engine/cms-orm/cms-orm.module';
import { FavoriteFolderDeletionListener } from 'src/modules/favorite-folder/listeners/favorite-folder.listener';

@Module({
  imports: [CMSORMModule],
  providers: [FavoriteFolderDeletionListener],
})
export class FavoriteFolderModule {}
