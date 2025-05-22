const { EntitySchema } = require('typeorm');

module.exports = {
  Request: new EntitySchema({
    name: 'Request',
    tableName: 'requests',
    columns: {
      id: {
        primary: true,
        type: 'int',
        generated: true,
      },
      accessType: {
        type: 'varchar',
      },
      reason: {
        type: 'text',
      },
      status: {
        type: 'varchar',
      },
    },
    relations: {
      user: {
        type: 'many-to-one',
        target: 'User',
        joinColumn: true,
        eager: true,
        nullable: false,
      },
      software: {
        type: 'many-to-one',
        target: 'Software',
        joinColumn: true,
        eager: true,
        nullable: false,
      },
    },
  }),
};
