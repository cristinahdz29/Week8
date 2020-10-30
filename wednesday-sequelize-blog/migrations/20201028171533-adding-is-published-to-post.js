'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Posts', 'is_published', {
      type: Sequelize.BOOLEAN
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Posts', 'is_published')
  }
};
