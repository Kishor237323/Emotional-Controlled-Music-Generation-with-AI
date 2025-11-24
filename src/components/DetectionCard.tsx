import { motion } from "framer-motion";

const DetectionCard = ({
  icon: Icon,
  title,
  description,
  buttonText,
  onClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="
        rounded-xl 
        bg-white/25 
        backdrop-blur-xl 
        shadow-lg 
        border border-white/30 
        p-5 
        max-w-sm 
        mx-auto
      "
      style={{ minHeight: "260px" }}  // smaller height
    >
      {/* Smaller floating icon */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="
          mx-auto mb-4
          h-14 w-14 
          rounded-full 
          bg-white 
          shadow-md 
          flex items-center justify-center
        "
      >
        <Icon className="h-7 w-7 text-primary" />
      </motion.div>

      {/* Smaller Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Smaller Description */}
      <p className="text-gray-700 text-sm leading-relaxed mb-4">
        {description}
      </p>

      {/* Smaller Button */}
      <button
        onClick={onClick}
        className="
          w-full py-2.5 
          bg-primary text-white 
          rounded-lg 
          text-sm 
          hover:bg-primary/90 
          transition
        "
      >
        {buttonText}
      </button>
    </motion.div>
  );
};

export default DetectionCard;
