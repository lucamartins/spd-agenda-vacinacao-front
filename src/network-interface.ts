export interface ApiResponse<TData = null> {
  status: number;
  message: string;
  timestamp: number;
  data: TData;
}
