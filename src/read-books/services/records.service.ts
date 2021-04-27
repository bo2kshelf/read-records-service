import {Injectable} from '@nestjs/common';
import {int} from 'neo4j-driver';
import {OrderBy} from '../../common/order-by.enum';
import {Neo4jService} from '../../neo4j/neo4j.service';
import {ReadBookRecordEntity} from '../entities/read-book.entity';

@Injectable()
export class RecordsService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async getReadBooksFromUser(
    userId: string,
    {
      skip,
      limit,
      orderBy,
    }: {skip: number; limit: number; orderBy: {title: OrderBy}},
  ): Promise<{
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
    nodes: ReadBookRecordEntity[];
  }> {
    const nodes: ReadBookRecordEntity[] = await this.neo4jService
      .read(
        `
        MATCH (u:User {id: $userId})
        MATCH (u)-[:RECORDED]->(:Record)-[:RECORD_OF]->(b:Book)
        WITH DISTINCT b, u
        ORDER BY b.title ${orderBy.title}
        SKIP $skip LIMIT $limit
        RETURN b.id AS b, u.id AS u
        `,
        {userId, skip: int(skip), limit: int(limit)},
      )
      .then((result) =>
        result.records.map((record) => ({
          userId: record.get('u'),
          bookId: record.get('b'),
        })),
      );
    const meta: {
      count: number;
      hasNext: boolean;
      hasPrevious: boolean;
    } = await this.neo4jService
      .read(
        `
        MATCH (:User {id: $userId})-[:RECORDED]->(:Record)-[:RECORD_OF]->(b)
        WITH DISTINCT b
        WITH count(b) AS count
        RETURN count, 0 < count AND 0 < $skip AS previous, $skip + $limit < count AS next
  `,
        {userId, skip: int(skip), limit: int(limit)},
      )
      .then((result) => ({
        count: result.records[0].get('count').toNumber(),
        hasNext: result.records[0].get('next'),
        hasPrevious: result.records[0].get('previous'),
      }));
    return {nodes, ...meta};
  }
}