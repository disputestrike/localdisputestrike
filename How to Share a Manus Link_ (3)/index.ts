    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Get user ID from session
      // We need to pass the full options to createContext
      const ctx = await createContext({ req, res } as any);
      const userId = ctx.user?.id;
      
      if (!userId) {
        console.warn('[Upload] Unauthorized upload attempt');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const bureau = req.body.bureau || 'document';
      const fileName = req.file.originalname;
      
      // Generate file key and save
      const fileKey = fileStorage.generateFileKey(
        userId,
        bureau,
        fileName
      );
      
      const result = await fileStorage.saveFile(fileKey, req.file.buffer, req.file.mimetype);
      
      res.json({
        success: true,
        fileUrl: result.fileUrl,
        fileKey: result.fileKey,
      });
    } catch (error) {
      console.error('[Upload] Error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });
  