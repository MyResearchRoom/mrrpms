
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("journalsMaster", {
            id: {
              type: Sequelize.INTEGER,
              primaryKey: true,
              autoIncrement: true,
              allowNull: false,
            },

            journalCode: {
              type: Sequelize.STRING(20),
              allowNull: false,
              unique: true,
            },

            journalName: {
              type: Sequelize.STRING,
              allowNull: false,
              unique: true,
            },

            link: {
              type: Sequelize.STRING,
              allowNull: false,
            },

            quartile: {
              type: Sequelize.ENUM("Q1", "Q2", "Q3", "Q4"),
              allowNull: false,
            },

            apcAmount: {
              type: Sequelize.DECIMAL(12, 2),
              allowNull: false,
            },
      
            abbreviation: {
              type: Sequelize.STRING,
              allowNull: true,
            },
      
            publisher: {
              type: Sequelize.STRING,
              allowNull: true,
            },
      
            printISSN: {
              type: Sequelize.STRING,
              allowNull: true,
            },
      
            onlineISSN: {
              type: Sequelize.STRING,
              allowNull: true,
            },
      
            country: {
              type: Sequelize.STRING(100),
              allowNull: true,
            },
      
            language: {
              type: Sequelize.STRING(100),
              allowNull: true,
            },
      
            since: {
              type: Sequelize.INTEGER,
              allowNull: true,
            },
      
            submissionUrl: {
              type: Sequelize.STRING(2048),
              allowNull: true,
              validate: {
                isUrl: true,
              },
            },
      
            category: {
              type: Sequelize.STRING,
              allowNull: true,
            },
      
            subjectArea: {
              type: Sequelize.STRING(255),
              allowNull: true,
            },
      
            keywords: {
              type: Sequelize.JSON,
              allowNull: true,
            },
      
            articleTypes: {
              type: Sequelize.STRING,
              allowNull: true,
            },
      
            frequency: {
              type: Sequelize.ENUM(
                "Weekly",
                "Monthly",
                "Bimonthly",
                "Quarterly",
                "Continuous",
                "Annual"
              ),
              allowNull: true,
            },
      
            impactFactor: {
              type: Sequelize.DECIMAL(10, 4),
              allowNull: true,
            },
      
            impactFactorYear: {
              type: Sequelize.INTEGER,
              allowNull: true,
            },
      
            fiveYearImpactFactor: {
              type: Sequelize.DECIMAL(10, 4),
              allowNull: true,
            },
      
            citeScore: {
              type: Sequelize.DECIMAL(10, 4),
              allowNull: true,
            },
      
            sjr: {
              type: Sequelize.DECIMAL(10, 4),
              allowNull: true,
            },
      
            hIndex: {
              type: Sequelize.INTEGER,
              allowNull: true,
            },
      
            acceptanceRate: {
              type: Sequelize.DECIMAL(5, 2),
              allowNull: true,
              validate: {
                min: 0,
                max: 100,
              },
            },
      
            indexing: {
              type: Sequelize.JSON,
              allowNull: true,
            },
      
            accessType: {
              type: Sequelize.ENUM(
                "Subscription",
                "Fully Open Access",
                "Hybrid",
                "Diamond (free to author)"
              ),
              allowNull: true,
            },
      
      
            currency: {
              type: Sequelize.ENUM("USD", "EUR", "GBP", "INR"),
              allowNull: true,
            },
      
            otherFees: {
              type: Sequelize.TEXT,
              allowNull: true,
            },
      
            license: {
              type: Sequelize.ENUM(
                "CC BY",
                "CC BY-NC",
                "CC BY-NC-ND",
                "CC BY-SA",
                "Copyright retained by publisher"
              ),
              allowNull: true,
            },
      
            waiverAvailable: {
              type: Sequelize.ENUM("Yes", "No", "Partial"),
              allowNull: true,
            },
      
            isPredatory: {
              type: Sequelize.BOOLEAN,
              allowNull: false,
              defaultValue: false,
            },
      
            isPeerReviewed: {
              type: Sequelize.BOOLEAN,
              allowNull: false,
              defaultValue: false,
            },
      
            firstDecisionDays: {
              type: Sequelize.INTEGER,
              allowNull: true,
            },
      
            peerReviewDays: {
              type: Sequelize.INTEGER,
              allowNull: true,
            },
      
            revisionRoundDays: {
              type: Sequelize.INTEGER,
              allowNull: true,
            },
      
            submissionToAcceptanceDays: {
              type: Sequelize.INTEGER,
              allowNull: true,
            },
      
            acceptanceToPublicationDays: {
              type: Sequelize.INTEGER,
              allowNull: true,
            },
      
            totalPublicationDays: {
              type: Sequelize.INTEGER,
              allowNull: true,
            },
      
            issuesPerYear: {
              type: Sequelize.INTEGER,
              allowNull: true,
            },
      
            articlesPerYear: {
              type: Sequelize.INTEGER,
              allowNull: true,
            },
      
            hasOnlineFirst: {
              type: Sequelize.BOOLEAN,
              allowNull: false,
              defaultValue: false,
            },
      
            hasFastTrack: {
              type: Sequelize.BOOLEAN,
              allowNull: false,
              defaultValue: false,
            },
      
          
            reviewType: {
              type: Sequelize.ENUM(
                "Single blind",
                "Double blind",
                "Open peer review",
                "Editorial (invited)"
              ),
              allowNull: true,
            },
      
            manuscriptLengthLimit: {
              type: Sequelize.STRING(255),
              allowNull: true,
            },
      
            editorInChief: {
              type: Sequelize.STRING(255),
              allowNull: true,
            },
      
            contactEmail: {
              type: Sequelize.STRING(255),
              allowNull: true,
              validate: {
                isEmail: true,
              },
            },
      
            preprintsAllowed: {
              type: Sequelize.BOOLEAN,
              allowNull: false,
              defaultValue: false,
            },
      
            invitedArticlesOnly: {
              type: Sequelize.BOOLEAN,
              allowNull: false,
              defaultValue: false,
            },
      
            notes: {
              type: Sequelize.TEXT,
              allowNull: true,
            },

            createdAt: {
              type: Sequelize.DATE,
              allowNull: false,
            },

            updatedAt: {
              type: Sequelize.DATE,
              allowNull: false,
            },
    });

    await queryInterface.addIndex("journalsMaster", ["journalName"], {
      name: "unique_journals_name",
      unique: true,
    });
    await queryInterface.addIndex("journalsMaster", ["journalCode"], {
      name: "unique_journals_code",
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("journalsMaster");
  },
};
