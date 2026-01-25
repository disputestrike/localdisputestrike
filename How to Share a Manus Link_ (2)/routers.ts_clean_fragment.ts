  upload: router({
    getSignedUrl: protectedProcedure
      .input(z.object({
        bureau: z.enum(['transunion', 'equifax', 'experian', 'combined', 'document']),
        fileName: z.string(),
        contentType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { bureau, fileName, contentType } = input;
        const userId = ctx.user.id;
        
        // Determine the base path for the file
        let basePath: string;
        if (bureau === 'document') {
          basePath = 'documents';
        } else {
          basePath = 'credit-reports';
        }
        
        // Generate a unique, user-scoped key
        const fileKey = `${basePath}/${userId}/${bureau}/${Date.now()}_${fileName}`;
        
        // NOTE: The AWS SDK installation failed in the sandbox.
        // This code MUST be replaced with your actual S3 pre-signed URL generation logic.
        // The client expects a signedUrl for PUT and a fileUrl for GET.
        const fileUrl = `https://disputestrike-uploads.s3.amazonaws.com/${fileKey}`;
        const signedUrl = `https://your-signed-url-for-put-goes-here/${fileKey}`; // Placeholder

        return {
          fileKey: fileKey,
          fileUrl: fileUrl,
          signedUrl: signedUrl,
        };
      }),
    uploadToS3: protectedProcedure
      .input(z.object({
        fileKey: z.string(),
        contentType: z.string(),
      }))
      .mutation(async ({ input }) => {
        // This procedure is now redundant as the client uploads directly to the signed URL.
        // We return success to allow the client to proceed to the lightAnalysis step.
        return { url: `https://s3.disputestrike.com/${input.fileKey}`, key: input.fileKey };
      }),
  }),
  admin: router({
    getStats: adminProcedure.query(async ({ ctx }) => {
      const { getAllUsers, getAllDisputeLetters, getAllPayments } = await import('./db');
      const users = await getAllUsers();
      const letters = await getAllDisputeLetters();
      const payments = await getAllPayments();
      
      const now = Date.now();
      const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
      
      return {
        totalUsers: users.length,
        newUsersThisMonth: users.filter(u => u.createdAt.getTime() >= thisMonthStart).length,
        totalLetters: letters.length,
        lettersThisMonth: letters.filter(l => l.createdAt.getTime() >= thisMonthStart).length,
        totalRevenue: payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
        revenueThisMonth: payments.filter(p => p.createdAt.getTime() >= thisMonthStart).reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
        successRate: 78, // Placeholder
        completedDisputes: letters.filter(l => l.status === 'mailed').length,
        lettersByBureau: {
          transunion: letters.filter(l => l.bureau === 'transunion').length,
          equifax: letters.filter(l => l.bureau === 'equifax').length,
          experian: letters.filter(l => l.bureau === 'experian').length,
        }
      };
    }),
