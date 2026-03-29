import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class CreateFavouritesTable1773991086582 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'favourites',
        columns: [
          {
            name: 'favourite_id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'product_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign key constraint for user_id
    await queryRunner.createForeignKey(
      'favourites',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['user_id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key constraint for product_id
    await queryRunner.createForeignKey(
      'favourites',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['product_id'],
        referencedTableName: 'product',
        onDelete: 'CASCADE',
      }),
    );

    // Add unique constraint to prevent duplicate favourites
    await queryRunner.createUniqueConstraint(
      'favourites',
      new TableUnique({
        name: 'UQ_FAVOURITES_USER_PRODUCT',
        columnNames: ['user_id', 'product_id'],
      }),
    );

    // Add indexes for better performance
    await queryRunner.createIndex(
      'favourites',
      new TableIndex({
        name: 'IDX_FAVOURITES_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'favourites',
      new TableIndex({
        name: 'IDX_FAVOURITES_PRODUCT_ID',
        columnNames: ['product_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('favourites');
  }
}
