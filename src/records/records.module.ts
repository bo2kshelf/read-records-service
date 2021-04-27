import {Module} from '@nestjs/common';
import {RecordResolver} from './resolvers/records.resolver';
import {UsersResolver} from './resolvers/users.resolver';
import {RecordsService} from './services/records.service';

@Module({
  imports: [],
  providers: [RecordsService, RecordResolver, UsersResolver],
  exports: [RecordsService],
})
export class RecordsModule {}
