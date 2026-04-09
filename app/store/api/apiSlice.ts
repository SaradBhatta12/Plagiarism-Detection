import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Assignment", "Submission", "User"],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    getMe: builder.query({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/me",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),


    getAssignments: builder.query({
      query: () => "/assignments",
      providesTags: ["Assignment"],
    }),
    createAssignment: builder.mutation({
      query: (newAssignment) => ({
        url: "/assignments",
        method: "POST",
        body: newAssignment,
      }),
      invalidatesTags: ["Assignment"],
    }),
    getSubmissions: builder.query({
      query: () => "/submissions",
      providesTags: ["Submission"],
    }),
    createSubmission: builder.mutation({
      query: (newSubmission) => ({
        url: "/submissions",
        method: "POST",
        body: newSubmission,
      }),
      invalidatesTags: ["Submission"],
    }),
    getAssignmentById: builder.query({
      query: (id) => `/assignments/${id}`,
      providesTags: (result, error, id) => [{ type: "Assignment", id }],
    }),
    getSubmissionById: builder.query({
      query: (id) => `/submissions/${id}`,
      providesTags: (result, error, id) => [{ type: "Submission", id }],
    }),


    runPlagiarismScan: builder.mutation({
      query: (submissionId) => ({
        url: "/plagiarism",
        method: "POST",
        body: { submissionId },
      }),
      invalidatesTags: (result, error, { submissionId }) => [{ type: "Submission", id: submissionId }],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLogoutMutation,
  useGetAssignmentsQuery,
  useGetAssignmentByIdQuery,
  useGetSubmissionByIdQuery,
  useCreateAssignmentMutation,
  useGetSubmissionsQuery,
  useCreateSubmissionMutation,
  useRunPlagiarismScanMutation,
} = apiSlice;
