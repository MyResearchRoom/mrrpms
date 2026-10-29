"use strict";

const { Op, Sequelize } = require("sequelize");
const { validateQueryParams } = require("../utils/validateQueryParams");

const {
  sequelize,
  ProjectDocumentJournal,
  ProjectDocument,
  Project,
  User,
  ProjectJournalArticle,
  JournalArticleStatusHistory,
  Journal,
} = require("../models");

const validQuartiles = ["Q1", "Q2", "Q3", "Q4"];

exports.createJournal = async (req, res) => {
  try {
    const {
      journalName,
      link,
      quartile,
      apcAmount,

      abbreviation,
      publisher,
      printISSN,
      onlineISSN,
      country,
      language,
      since,
      submissionUrl,

      category,
      subjectArea,
      keywords,
      articleTypes,
      frequency,
      
      impactFactor,
      impactFactorYear,
      fiveYearImpactFactor,
      citeScore,
      sjr,
      hIndex,
      acceptanceRate,

      indexing,
      accessType,
      currency,
      otherFees,
      license,
      waiverAvailable,
      isPredatory,
      isPeerReviewed,

      firstDecisionDays,
      peerReviewDays,
      revisionRoundDays,
      submissionToAcceptanceDays,
      acceptanceToPublicationDays,
      totalPublicationDays,
      issuesPerYear,
      articlesPerYear,
      hasOnlineFirst,
      hasFastTrack,

      reviewType,
      manuscriptLengthLimit,
      editorInChief,
      contactEmail,
      preprintsAllowed,
      invitedArticlesOnly,
      notes,
    } = req.body;


    if (
      typeof journalName !== "string" ||
      !journalName.trim() ||
      typeof link !== "string" ||
      !link.trim() ||
      !quartile ||
      !apcAmount
    ) {
      return res.status(400).json({
        success: false,
        message: "Journal name, link, APC amount and quartile are required.",
      });
    }

    const normalizedName = journalName.trim();

    const validQuartiles = ["Q1", "Q2", "Q3", "Q4"];

    if (!validQuartiles.includes(quartile)) {
      return res.status(400).json({
        success: false,
        message: "Quartile must be Q1, Q2, Q3 or Q4.",
      });
    }

    const existingJournal = await Journal.findOne({
      where: {
        journalName: normalizedName,
      },
    });

    if (existingJournal) {
      return res.status(409).json({
        success: false,
        message: "Journal already exists with this name.",
      });
    }

    const latestJournal = await Journal.findOne({
      where: {
        journalCode: {
          [Op.regexp]: "^JRN_[0-9]+$",
        },
      },
      order: [["id", "DESC"]],
    });

    let nextNumber = 1;

    if (latestJournal) {
      const match = latestJournal.journalCode.match(/^JRN_(\d+)$/);

      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const journalCode = `JRN_${String(nextNumber).padStart(4, "0")}`;

    const journal = await Journal.create({
      journalCode,
      journalName: normalizedName,
      link: link.trim(),
      quartile,
      apcAmount,

      abbreviation,
      publisher,
      printISSN,
      onlineISSN,
      country,
      language,
      since,
      submissionUrl,

      category,
      subjectArea,
      keywords,
      articleTypes,
      frequency,

      impactFactor,
      impactFactorYear,
      fiveYearImpactFactor,
      citeScore,
      sjr,
      hIndex,
      acceptanceRate,

      indexing,
      accessType,
      currency,
      otherFees,
      license,
      waiverAvailable,
      isPredatory,
      isPeerReviewed,

      firstDecisionDays,
      peerReviewDays,
      revisionRoundDays,
      submissionToAcceptanceDays,
      acceptanceToPublicationDays,
      totalPublicationDays,
      issuesPerYear,
      articlesPerYear,
      hasOnlineFirst,
      hasFastTrack,

      reviewType,
      manuscriptLengthLimit,
      editorInChief,
      contactEmail,
      preprintsAllowed,
      invitedArticlesOnly,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: "Journal added successfully.",
      data: journal,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message:
          "Journal code or journal name already exists. Please retry.",
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: error.errors.map((item) => item.message).join(", "),
      });
    }

    console.error("Create journal error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add journal.",
    });
  }
};

exports.getAllJournals = async (req, res) => {
  try {
    // const { page, limit, offset, searchTerm } = validateQueryParams({
    //   ...req.query,
    // });
    const fetchAll =
      typeof req.query.limit === "string" &&
      req.query.limit.trim().toLowerCase() === "all";

    const { page, limit, offset, searchTerm } = validateQueryParams({
      ...req.query,
      limit: fetchAll ? undefined : req.query.limit,
    });
    const {quartile,sortOrder} = req.query;

    const sortOrderFilter =
        sortOrder?.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const whereClause = {};

    if (quartile && quartile.trim() !== "" &&  quartile.trim()!=="All") {
      if (!validQuartiles.includes(quartile)) {
        return res.status(400).json({
          success: false,
          message: "Quartile must be Q1, Q2, Q3, or Q4.",
        });
      }

      whereClause.quartile = quartile;
    }

    const search = searchTerm.trim();

    if (search) {
      const searchConditions = [
        { journalCode: { [Op.like]: `%${search}%` } },
        { journalName: { [Op.like]: `%${search}%` } },
        { link: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } },
        { abbreviation: { [Op.like]: `%${search}%` } },
        { publisher: { [Op.like]: `%${search}%` } },
        { frequency: { [Op.like]: `%${search}%` } },

        sequelize.where(
          sequelize.fn(
            "JSON_SEARCH",
            sequelize.col("keywords"),
            "one",
            `%${search}%`
          ),
          { [Op.ne]: null }
        ),

        sequelize.where(
          sequelize.fn(
            "JSON_SEARCH",
            sequelize.col("indexing"),
            "one",
            `%${search}%`
          ),
          { [Op.ne]: null }
        ),
      ];

      if (["Q1", "Q2", "Q3", "Q4"].includes(search.toUpperCase())) {
        searchConditions.push({
          quartile: search.toUpperCase(),
        });
      }

      whereClause[Op.or] = searchConditions;
    }

    const queryOptions = {
      where: whereClause,
      order: [
        ["createdAt", sortOrderFilter],
        ["id", "DESC"],
      ],
    };

    if (!fetchAll) {
      queryOptions.limit = limit;
      queryOptions.offset = offset;
    }

    const { count, rows } = await Journal.findAndCountAll(queryOptions);

    // const {count,rows} =  await Journal.findAndCountAll({
    //   where: whereClause,
    //   order: [
    //     ["createdAt", sortOrderFilter],
    //     ["id", "DESC"],
    //   ],
    //   limit: limit,
    //   offset,
    // })

    return res.status(200).json({
      success: true,
      message: "Journal fetched successfully.",
      data: rows,
      pagination: {
        totalItems: count,
        totalPages: fetchAll ? 1 : Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: fetchAll ? count : limit,
      },
    });

  } catch (error) {
    console.error("Get all journals error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve journals.",
    });
  }
};

exports.getJournalBYId = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid journal ID is required.",
      });
    }

    const journal = await Journal.findByPk(id);

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: "Journal not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Journal fetched successfully.",
      data: journal,
    });
  } catch (error) {
    console.error("Get journal error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve journal.",
    });
  }
};

exports.updateJournal = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid journal ID is required.",
      });
    }

    const journal = await Journal.findByPk(id);

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: "Journal not found.",
      });
    }

    const {
      journalName,
      link,
      quartile,
      abbreviation,
      publisher,
      printISSN,
      onlineISSN,
      country,
      language,
      since,
      submissionUrl,
      category,
      subjectArea,
      keywords,
      articleTypes,
      frequency,
      apcAmount,
      impactFactor,
      impactFactorYear,
      fiveYearImpactFactor,
      citeScore,
      sjr,
      hIndex,
      acceptanceRate,
      indexing,
      accessType,
      currency,
      otherFees,
      license,
      waiverAvailable,
      isPredatory,
      isPeerReviewed,
      firstDecisionDays,
      peerReviewDays,
      revisionRoundDays,
      submissionToAcceptanceDays,
      acceptanceToPublicationDays,
      totalPublicationDays,
      issuesPerYear,
      articlesPerYear,
      hasOnlineFirst,
      hasFastTrack,
      reviewType,
      manuscriptLengthLimit,
      editorInChief,
      contactEmail,
      preprintsAllowed,
      invitedArticlesOnly,
      notes,
    } = req.body;

    if (
      journalName !== undefined &&
      (typeof journalName !== "string" || !journalName.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Journal name cannot be empty.",
      });
    }

    if (journalName !== undefined) {
      const normalizedName = journalName.trim();

      const existingJournal = await Journal.findOne({
        where: {
          journalName: normalizedName,
          id: { [require("sequelize").Op.ne]: id },
        },
      });

      if (existingJournal) {
        return res.status(409).json({
          success: false,
          message: "Another journal already exists with this name.",
        });
      }
    }

    if (
      quartile !== undefined &&
      !["Q1", "Q2", "Q3", "Q4"].includes(quartile)
    ) {
      return res.status(400).json({
        success: false,
        message: "Quartile must be Q1, Q2, Q3 or Q4.",
      });
    }

    const updateData = {
      ...(journalName !== undefined && {
        journalName: journalName.trim(),
      }),
      ...(link !== undefined && { link }),
      ...(quartile !== undefined && { quartile }),
      ...(abbreviation !== undefined && { abbreviation }),
      ...(publisher !== undefined && { publisher }),
      ...(printISSN !== undefined && { printISSN }),
      ...(onlineISSN !== undefined && { onlineISSN }),
      ...(country !== undefined && { country }),
      ...(language !== undefined && { language }),
      ...(since !== undefined && { since }),
      ...(submissionUrl !== undefined && { submissionUrl }),
      ...(category !== undefined && { category }),
      ...(subjectArea !== undefined && { subjectArea }),
      ...(keywords !== undefined && { keywords }),
      ...(articleTypes !== undefined && { articleTypes }),
      ...(frequency !== undefined && { frequency }),
      ...(apcAmount !== undefined && { apcAmount }),
      ...(impactFactor !== undefined && { impactFactor }),
      ...(impactFactorYear !== undefined && { impactFactorYear }),
      ...(fiveYearImpactFactor !== undefined && { fiveYearImpactFactor }),
      ...(citeScore !== undefined && { citeScore }),
      ...(sjr !== undefined && { sjr }),
      ...(hIndex !== undefined && { hIndex }),
      ...(acceptanceRate !== undefined && { acceptanceRate }),
      ...(indexing !== undefined && { indexing }),
      ...(accessType !== undefined && { accessType }),
      ...(currency !== undefined && { currency }),
      ...(otherFees !== undefined && { otherFees }),
      ...(license !== undefined && { license }),
      ...(waiverAvailable !== undefined && { waiverAvailable }),
      ...(isPredatory !== undefined && { isPredatory }),
      ...(isPeerReviewed !== undefined && { isPeerReviewed }),
      ...(firstDecisionDays !== undefined && { firstDecisionDays }),
      ...(peerReviewDays !== undefined && { peerReviewDays }),
      ...(revisionRoundDays !== undefined && { revisionRoundDays }),
      ...(submissionToAcceptanceDays !== undefined && {
        submissionToAcceptanceDays,
      }),
      ...(acceptanceToPublicationDays !== undefined && {
        acceptanceToPublicationDays,
      }),
      ...(totalPublicationDays !== undefined && { totalPublicationDays }),
      ...(issuesPerYear !== undefined && { issuesPerYear }),
      ...(articlesPerYear !== undefined && { articlesPerYear }),
      ...(hasOnlineFirst !== undefined && { hasOnlineFirst }),
      ...(hasFastTrack !== undefined && { hasFastTrack }),
      ...(reviewType !== undefined && { reviewType }),
      ...(manuscriptLengthLimit !== undefined && { manuscriptLengthLimit }),
      ...(editorInChief !== undefined && { editorInChief }),
      ...(contactEmail !== undefined && { contactEmail }),
      ...(preprintsAllowed !== undefined && { preprintsAllowed }),
      ...(invitedArticlesOnly !== undefined && { invitedArticlesOnly }),
      ...(notes !== undefined && { notes }),
    };

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update.",
      });
    }

    await journal.update(updateData);

    return res.status(200).json({
      success: true,
      message: "Journal updated successfully.",
      data: journal,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "A journal with this name or code already exists.",
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: error.errors.map((item) => item.message).join(", "),
      });
    }

    console.error("Update journal error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update journal.",
    });
  }
};

exports.deleteJournal = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const journalId = Number(req.params.id);

    if (!Number.isInteger(journalId) || journalId <= 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Valid journal ID is required.",
      });
    }

    const journal = await Journal.findByPk(journalId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!journal) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Journal not found.",
      });
    }

    const projectDocJournal = await ProjectDocumentJournal.findOne({
      where: { journalId },
      attributes: ["id", "journalId"],
      transaction,
    });

    if (projectDocJournal) {
      await transaction.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Cannot delete this document journal because it is associated with a project journal article document.",
      });
    }

    await journal.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Journal deleted successfully.",
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("Delete Journal Error:", error);

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete this journal because related records exist.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete journal.",
    });
  }
};


exports.getAllJournalsToDownloadExcel = async (req, res) => {
  try {
    const {quartile,sortOrder,searchTerm} = req.query;

    const sortOrderFilter =
        sortOrder?.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const whereClause = {};

    if (quartile && quartile.trim() !== "" &&  quartile.trim()!=="All") {
      if (!validQuartiles.includes(quartile)) {
        return res.status(400).json({
          success: false,
          message: "Quartile must be Q1, Q2, Q3, or Q4.",
        });
      }

      whereClause.quartile = quartile;
    }

    const search = searchTerm.trim();

    if (search) {
      const searchConditions = [
        { journalCode: { [Op.like]: `%${search}%` } },
        { journalName: { [Op.like]: `%${search}%` } },
        { link: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } },
        { abbreviation: { [Op.like]: `%${search}%` } },
        { publisher: { [Op.like]: `%${search}%` } },
        { frequency: { [Op.like]: `%${search}%` } },
        { accessType: { [Op.like]: `%${search}%` } },

        sequelize.where(
          sequelize.fn(
            "JSON_SEARCH",
            sequelize.col("keywords"),
            "one",
            `%${search}%`
          ),
          { [Op.ne]: null }
        ),

        sequelize.where(
          sequelize.fn(
            "JSON_SEARCH",
            sequelize.col("indexing"),
            "one",
            `%${search}%`
          ),
          { [Op.ne]: null }
        ),
      ];

      if (["Q1", "Q2", "Q3", "Q4"].includes(search.toUpperCase())) {
        searchConditions.push({
          quartile: search.toUpperCase(),
        });
      }

      whereClause[Op.or] = searchConditions;
    }

    const rows =  await Journal.findAll({
      where: whereClause,
      order: [
        ["createdAt", sortOrderFilter],
        ["id", "DESC"],
      ],
    })

    return res.status(200).json({
      success: true,
      message: "Journal fetched successfully.",
      data: rows,
    });

  } catch (error) {
    console.error("Get all journals error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve journals.",
    });
  }
};
