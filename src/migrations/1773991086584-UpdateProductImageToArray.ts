import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateProductImageToArray1773991086584 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convert existing scalar image values into single-element array values
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "image" TYPE varchar[] USING (CASE WHEN "image" IS NULL THEN NULL ELSE ARRAY["image"] END)`,
    );

    // Set default to empty array for new records and keep as nullable
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "image" SET DEFAULT '{}';`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Convert array values back into scalar values (first element) where possible
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "image" TYPE varchar USING (CASE WHEN "image" IS NULL THEN NULL WHEN cardinality("image") = 0 THEN NULL ELSE "image"[1] END)`,
    );

    // Remove the default
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "image" DROP DEFAULT;`,
    );
  }
}
