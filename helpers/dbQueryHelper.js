class QueryHelper {
  getPagination = (queryParams) => {
    const { pageNum, pageLimit, sort, sortBy } = queryParams;
    return {
      page: pageNum,
      limit: pageLimit,
      skip: pageLimit * (pageNum - 1),
      sort: { [sort]: sortBy == "asc" ? 1 : -1 },
    };
  };

  getAggregationPagination = (mainQuery, paginationObj) => {
    return [
      ...mainQuery,
      ...[
        { $sort: paginationObj.sort },
        { $skip: paginationObj.skip },
        { $limit: paginationObj.limit },
      ],
    ];
  };

  getTotalCountQuery = (mainQuery) => {
    return [
      ...mainQuery,
      ...[
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ],
    ];
  };

  searchDataArr = (searchProps, searchKey) => {
    const orFilter = [];
    searchProps.forEach((s) => {
      orFilter.push({
        [s]: {
          $regex: this.removeSpecialCharFromSearch(searchKey),
          $options: "i",
        },
      });
    });

    return orFilter.length > 0 ? { ["$or"]: orFilter } : {};
  };

  removeSpecialCharFromSearch = (search) => {
    return search
      .trim()
      .replace(/\!/g, "\\!")
      .replace(/\@/g, "\\@")
      .replace(/\#/g, "\\#")
      .replace(/\$/g, "\\$")
      .replace(/\%/g, "\\%")
      .replace(/\^/g, "\\^")
      .replace(/\&/g, "\\&")
      .replace(/\*/g, "\\*")
      .replace(/\)/g, "\\)")
      .replace(/\(/g, "\\(")
      .replace(/\[/g, "\\[")
      .replace(/\]/g, "\\]")
      .replace(/\;/g, "\\;")
      .replace(/\{/g, "\\{")
      .replace(/\}/g, "\\}")
      .replace(/\,/g, "\\,");
  };
}

module.exports = new QueryHelper();
