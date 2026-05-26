const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A task must have a title'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    dueDate: {
        type: Date,
        required: [true, 'A task must have a due date for tracking deadlines']
    }
}, {
    timestamps: true // Automatically creates 'createdAt' and 'updatedAt' fields
});

// We will add indexing here later to achieve that 30% retrieval speed boost!

module.exports = mongoose.model('Task', taskSchema);