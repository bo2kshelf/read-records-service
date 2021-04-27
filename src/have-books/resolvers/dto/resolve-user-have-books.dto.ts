import {ArgsType, Field, InputType, Int, ObjectType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';
import {HaveBookRecordEntity} from '../../entities/have-book-record.entity';

@InputType()
export class UserHaveBooksArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.DESC})
  updatedAt!: OrderBy;
}

@ArgsType()
export class UserHaveBooksArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => UserHaveBooksArgsOrderBy, {
    nullable: true,
    defaultValue: new UserHaveBooksArgsOrderBy(),
  })
  orderBy!: UserHaveBooksArgsOrderBy;
}

@ObjectType()
export class UserHaveBooksReturnType {
  @Field(() => [HaveBookRecordEntity])
  nodes!: HaveBookRecordEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}