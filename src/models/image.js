const { query } = require('../config/database');

class Image {
  static async findById(id) {
    const result = await query(
      `SELECT i.*, 
        u.first_name || ' ' || u.last_name as uploader_name
       FROM images i
       JOIN users u ON i.uploaded_by = u.id
       WHERE i.id = $1 AND i.deleted_at IS NULL`,
      [id]
    );
    return result.rows[0];
  }

  static async findByStatus(status, limit = 10) {
    const result = await query(
      `SELECT i.*, 
        u.first_name || ' ' || u.last_name as uploader_name
       FROM images i
       JOIN users u ON i.uploaded_by = u.id
       WHERE i.status = $1 AND i.deleted_at IS NULL
       ORDER BY i.created_at DESC
       LIMIT $2`,
      [status, limit]
    );
    return result.rows;
  }

  static async updateStatus(id, status, userId, reason = null) {
    const result = await query(
      `UPDATE images 
       SET status = $2,
           ${status === 'approved' ? 'approved_by' : 'rejected_by'} = $3,
           ${status === 'approved' ? 'approved_at' : 'rejected_at'} = NOW(),
           rejection_reason = $4
       WHERE id = $1
       RETURNING *`,
      [id, status, userId, reason]
    );
    return result.rows[0];
  }

  static async incrementDownloadCount(id) {
    await query(
      'UPDATE images SET download_count = download_count + 1 WHERE id = $1',
      [id]
    );
  }

  static async incrementPrintCount(id) {
    await query(
      'UPDATE images SET print_count = print_count + 1 WHERE id = $1',
      [id]
    );
  }

  static async getPopularTags(limit = 10) {
    const result = await query(`
      SELECT unnest(tags) as tag, COUNT(*) as count
      FROM images
      WHERE tags IS NOT NULL
      GROUP BY tag
      ORDER BY count DESC
      LIMIT $1
    `, [limit]);
    return result.rows;
  }
}

module.exports = Image;