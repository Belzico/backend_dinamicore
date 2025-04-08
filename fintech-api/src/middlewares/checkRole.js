module.exports = function checkRole(requiredRole) {
    return (req, res, next) => {
      try {
        const user = req.user; 
        if (!user) {
          return res.status(401).json({ error: 'Not authenticated' });
        }
  
        if (user.role !== requiredRole) {
          return res.status(403).json({ error: 'Access denied: insufficient permissions' });
        }
  
        next();
      } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }
    };
  };
  