import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {OrderBy} from '../../common/order-by.enum';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {HaveBookRecordEntity} from '../entities/have-book-record.entity';

@Injectable()
export class UsersService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async getHaveBooks(
    userId: string,
    {
      skip,
      limit,
      orderBy,
    }: {skip: number; limit: number; orderBy: {updatedAt: OrderBy}},
  ): Promise<{
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
    nodes: HaveBookRecordEntity[];
  }> {
    const records: HaveBookRecordEntity[] = await this.neo4jService
      .read(
        `
        MATCH (u:User {id: $userId})
        MATCH (u)-[r:HAS_BOOK]->(b:Book)
        RETURN u.id AS u, b.id AS b, r.updatedAt AS updatedAt
        ORDER BY r.updatedAt ${orderBy.updatedAt}
        SKIP $skip LIMIT $limit
        `,
        {userId, skip: int(skip), limit: int(limit)},
      )
      .then((result) =>
        result.records.map((record) => ({
          have: true,
          userId: record.get('u'),
          bookId: record.get('b'),
          updatedAt: new Date(record.get('updatedAt')),
        })),
      );
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
        MATCH p=(:User {id: $userId})-[r:HAS_BOOK]->()
        WITH count(p) AS count
        RETURN count, 0 < count AND 0 < $skip AS previous, $skip + $limit < count AS next
        `,
        {userId, skip: int(skip), limit: int(limit)},
      )
      .then((result) => ({
        count: result.records[0].get('count').toNumber(),
        hasNext: result.records[0].get('next'),
        hasPrevious: result.records[0].get('previous'),
      }));
    return {nodes: records, ...meta};
  }
}