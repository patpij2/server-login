const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');

class FileStorage {
    constructor() {
        // Create storage directory if it doesn't exist
        this.storageDir = path.join(__dirname, '../../storage');
        this.csvDir = path.join(this.storageDir, 'csv-exports');
        this.ensureDirectoriesExist();
    }

    ensureDirectoriesExist() {
        try {
            if (!fs.existsSync(this.storageDir)) {
                fs.mkdirSync(this.storageDir, { recursive: true });
                logger.info(`Created storage directory: ${this.storageDir}`);
            }
            if (!fs.existsSync(this.csvDir)) {
                fs.mkdirSync(this.csvDir, { recursive: true });
                logger.info(`Created CSV exports directory: ${this.csvDir}`);
            }
        } catch (error) {
            logger.error('Error creating storage directories:', error);
        }
    }

    // Save CSV file to server storage
    saveCSV(csvContent, metadata = {}) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const filename = `email_scraping_results_${timestamp}.csv`;
            const filepath = path.join(this.csvDir, filename);
            
            // Write CSV content to file
            fs.writeFileSync(filepath, csvContent, 'utf8');
            
            // Create metadata file
            const metadataFile = filepath.replace('.csv', '.json');
            const fileMetadata = {
                filename,
                filepath,
                timestamp: new Date().toISOString(),
                size: Buffer.byteLength(csvContent, 'utf8'),
                rowCount: csvContent.split('\n').length - 1, // Subtract header row
                ...metadata
            };
            
            fs.writeFileSync(metadataFile, JSON.stringify(fileMetadata, null, 2));
            
            logger.info(`CSV file saved: ${filename} (${fileMetadata.size} bytes, ${fileMetadata.rowCount} rows)`);
            
            return {
                success: true,
                filename,
                filepath,
                metadata: fileMetadata
            };
            
        } catch (error) {
            logger.error('Error saving CSV file:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get list of saved CSV files
    getCSVFiles(limit = 50) {
        try {
            const files = fs.readdirSync(this.csvDir)
                .filter(file => file.endsWith('.csv'))
                .sort((a, b) => {
                    // Sort by modification time (newest first)
                    const statA = fs.statSync(path.join(this.csvDir, a));
                    const statB = fs.statSync(path.join(this.csvDir, b));
                    return statB.mtime.getTime() - statA.mtime.getTime();
                })
                .slice(0, limit);

            const fileList = files.map(filename => {
                const filepath = path.join(this.csvDir, filename);
                const stat = fs.statSync(filepath);
                const metadataFile = filepath.replace('.csv', '.json');
                
                let metadata = {};
                if (fs.existsSync(metadataFile)) {
                    try {
                        metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
                    } catch (error) {
                        logger.error(`Error reading metadata for ${filename}:`, error);
                    }
                }

                return {
                    filename,
                    filepath,
                    size: stat.size,
                    created: stat.birthtime.toISOString(),
                    modified: stat.mtime.toISOString(),
                    metadata
                };
            });

            return {
                success: true,
                files: fileList,
                total: fileList.length
            };
            
        } catch (error) {
            logger.error('Error getting CSV files:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get specific CSV file
    getCSVFile(filename) {
        try {
            const filepath = path.join(this.csvDir, filename);
            
            if (!fs.existsSync(filepath)) {
                return {
                    success: false,
                    error: 'File not found'
                };
            }

            const content = fs.readFileSync(filepath, 'utf8');
            const stat = fs.statSync(filepath);
            const metadataFile = filepath.replace('.csv', '.json');
            
            let metadata = {};
            if (fs.existsSync(metadataFile)) {
                try {
                    metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
                } catch (error) {
                    logger.error(`Error reading metadata for ${filename}:`, error);
                }
            }

            return {
                success: true,
                content,
                filename,
                filepath,
                size: stat.size,
                created: stat.birthtime.toISOString(),
                modified: stat.mtime.toISOString(),
                metadata
            };
            
        } catch (error) {
            logger.error('Error getting CSV file:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Delete CSV file
    deleteCSVFile(filename) {
        try {
            const filepath = path.join(this.csvDir, filename);
            const metadataFile = filepath.replace('.csv', '.json');
            
            if (!fs.existsSync(filepath)) {
                return {
                    success: false,
                    error: 'File not found'
                };
            }

            // Delete CSV file
            fs.unlinkSync(filepath);
            
            // Delete metadata file if it exists
            if (fs.existsSync(metadataFile)) {
                fs.unlinkSync(metadataFile);
            }

            logger.info(`CSV file deleted: ${filename}`);
            
            return {
                success: true,
                message: 'File deleted successfully'
            };
            
        } catch (error) {
            logger.error('Error deleting CSV file:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Clean up old files (older than specified days)
    cleanupOldFiles(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            
            const files = fs.readdirSync(this.csvDir)
                .filter(file => file.endsWith('.csv'));
            
            let deletedCount = 0;
            
            files.forEach(filename => {
                const filepath = path.join(this.csvDir, filename);
                const stat = fs.statSync(filepath);
                
                if (stat.mtime < cutoffDate) {
                    this.deleteCSVFile(filename);
                    deletedCount++;
                }
            });

            logger.info(`Cleaned up ${deletedCount} old CSV files (older than ${daysOld} days)`);
            
            return {
                success: true,
                deletedCount
            };
            
        } catch (error) {
            logger.error('Error cleaning up old files:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get storage statistics
    getStorageStats() {
        try {
            const files = fs.readdirSync(this.csvDir)
                .filter(file => file.endsWith('.csv'));
            
            let totalSize = 0;
            let totalRows = 0;
            
            files.forEach(filename => {
                const filepath = path.join(this.csvDir, filename);
                const stat = fs.statSync(filepath);
                totalSize += stat.size;
                
                // Try to get row count from metadata
                const metadataFile = filepath.replace('.csv', '.json');
                if (fs.existsSync(metadataFile)) {
                    try {
                        const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
                        totalRows += metadata.rowCount || 0;
                    } catch (error) {
                        // If metadata read fails, count lines in CSV
                        const content = fs.readFileSync(filepath, 'utf8');
                        totalRows += content.split('\n').length - 1;
                    }
                }
            });

            return {
                success: true,
                stats: {
                    totalFiles: files.length,
                    totalSize,
                    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
                    totalRows,
                    storageDir: this.csvDir
                }
            };
            
        } catch (error) {
            logger.error('Error getting storage stats:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new FileStorage(); 