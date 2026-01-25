    .select()
    .from(courseCertificates)
    .where(eq(courseCertificates.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Get all progress
  const progress = await dbInstance
    .select()
    .from(courseProgress)
    .where(and(
      eq(courseProgress.userId, userId),
      eq(courseProgress.completed, true)
    ));

  // Check if all lessons complete
  if (progress.length < TOTAL_LESSONS) {
    throw new Error(`Complete all ${TOTAL_LESSONS} lessons to earn your certificate. You have completed ${progress.length}.`);
  }

  // Calculate stats
  const totalTimeSpent = progress.reduce((sum, p) => sum + (p.timeSpentSeconds || 0), 0);
  const quizScores = progress.filter(p => p.quizScore !== null).map(p => p.quizScore as number);
  const avgQuizScore = quizScores.length > 0 
    ? Math.round(quizScores.reduce((sum, s) => sum + s, 0) / quizScores.length)
    : null;

  // Generate certificate number
  const certNumber = `DS-${Date.now().toString(36).toUpperCase()}-${userId}`;

  // Create certificate
  const [result] = await dbInstance.insert(courseCertificates).values({
    userId,
    certificateNumber: certNumber,
    totalTimeSpentSeconds: totalTimeSpent,
    averageQuizScore: avgQuizScore,
  }).$returningId();

  const inserted = await dbInstance
    .select()
    .from(courseCertificates)
    .where(eq(courseCertificates.id, result.id))
    .limit(1);

  return inserted[0];
}
