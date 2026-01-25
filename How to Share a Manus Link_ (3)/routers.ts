
    /**
     * Get documents by type
     */
    getByType: protectedProcedure
      .input(z.object({ documentType: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getUserDocumentsByType(ctx.user.id, input.documentType);
      }),

    /**
     * Create new document record
     */
    create: protectedProcedure
      .input(z.object({
        documentType: z.enum([
          'government_id', 'drivers_license', 'passport', 'social_security_card',
          'utility_bill', 'bank_statement', 'lease_agreement', 'mortgage_statement',
          'pay_stub', 'tax_return', 'proof_of_address', 'dispute_letter',
          'bureau_response', 'certified_mail_receipt', 'return_receipt', 'other'
        ]),
        documentName: z.string(),
        description: z.string().optional(),
        fileKey: z.string(),
        fileUrl: z.string().optional(),
        fileName: z.string(),
        fileSize: z.number().optional(),
        mimeType: z.string().optional(),
        expiresAt: z.date().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createUserDocument({
          userId: ctx.user.id,
          ...input,
        });
      }),

    /**
     * Update document
     */
    update: protectedProcedure
      .input(z.object({
        documentId: z.number(),
        documentName: z.string().optional(),
        description: z.string().optional(),
        expiresAt: z.date().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {