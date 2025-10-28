import { IResponseDataWithPages } from "../types/Helper";

export class Paginate {
  constructor(
    private page: number = 1,
    private total: number = 0,
    private limit: number = 10,
    public data: any[] = []
  ) {}

  responsePaginate(pageParam: number, totalParam: number, limitParam: number) {
    this.setParams(pageParam, totalParam, limitParam);
    let result: IResponseDataWithPages<any> = {
      totalDatas: 0,
      totalPage: 0,
      previous: null,
      next: null,
      currePage: 0,
      rowsPerPage: 0,
      data: [],
    };
    let startIndex = (this.page - 1) * this.limit;
    // let endIndex = (page + 1) * limit;
    let endIndex = this.page * this.limit;
    result.totalDatas = this.total;
    result.totalPage = Math.ceil(this.total / this.limit);
    result.previous =
      startIndex > 0
        ? {
            pageNumber: this.page - 1 === 0 ? null : this.page - 1,
            limit: this.limit,
          }
        : null;
    // result.next = endIndex <= total ? { pageNumber: page + 1, limit: limit } : null;
    result.next =
      endIndex <= this.total
        ? { pageNumber: this.page + 1, limit: this.limit }
        : null;
    result.currePage = this.page;
    result.rowsPerPage = this.limit;
    return { result, startIndex, endIndex };
  }

  private setParams(
    pageParam: number,
    totalParam: number,
    limitParam: number
  ): void {
    this.page = pageParam;
    this.limit = limitParam;
    this.total = totalParam;
  }
}
