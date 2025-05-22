const { EntitySchema } = require('typeorm');

module.exports.Software = new EntitySchema({
  name: 'Software',
  tableName: 'softwares',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    name: {
      type: 'varchar',
    },
    description: {
      type: 'text',
      nullable: true,
    },
    accessLevels: {
      type: 'simple-array', // Stored as comma-separated string in DB
      nullable: true,
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true,
    },
  },
});
