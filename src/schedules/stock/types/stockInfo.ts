export type StockInfo = {
  basDt: string;
  isinCd: string;
  srtnCd: string;
  clpr: string;
  fltRt: string;
  itmsNm: string;
  mrktCtg: string;
  vs: string;
};

export type StockAPIRequestParams = {
  serviceKey: string;
  numOfRows: number;
  resultType: string;
  basDt: string;
  isinCd: string;
  beginMrktTotAmt: number;
  endMrktTotAmt: number;
  beginTrPrc: number;
};

export type StockAPIResponse = {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      numOfRows: number;
      pageNo: number;
      totalCount: number;
      items: {
        item: StockInfo[];
      };
    };
  };
};
