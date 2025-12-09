# analysis.R - Smart Column Cycling Edition
args <- commandArgs(trailingOnly = TRUE)

if (length(args) == 0) stop("No file provided.")

suppressPackageStartupMessages({
  library(ggplot2)
  library(dplyr)
  library(tidyr)
  library(ggridges)
})

filename <- args[1]
output_dir <- "./static/charts"

if (!dir.exists(output_dir)) dir.create(output_dir, recursive = TRUE)

# Read and Clean
data <- read.csv(filename)
data <- data %>% filter(rowSums(is.na(.)) != ncol(.))

# --- SMART COLUMN IDENTIFICATION ---
# 1. Identify Numeric Columns
all_nums <- select_if(data, is.numeric)
all_cats <- select_if(data, is.character)

# If no character columns, try to find factors
if (ncol(all_cats) == 0) {
    all_cats <- select_if(data, function(x) is.factor(x) || (is.numeric(x) && length(unique(x)) < 15))
}

# 2. Filter "Boring" Numerics (IDs, raw indexes)
# We keep them in 'all_nums' but create a 'good_nums' list for plotting
boring_patterns <- c("id", "week", "index", "serial")
good_nums <- all_nums %>% select(-matches(paste(boring_patterns, collapse="|")))

# If we filtered everything away (oops), revert to all_nums
if (ncol(good_nums) == 0) {
  good_nums <- all_nums
}

# 3. Find Specific "Stars" of the dataset
find_col <- function(patterns) {
  matches <- names(data)[grep(paste(patterns, collapse="|"), names(data), ignore.case=TRUE)]
  if (length(matches) > 0) return(matches[1]) else return(NULL)
}

col_grade  <- find_col(c("grade", "score", "mark", "gpa", "result"))
col_mood   <- find_col(c("mood", "happy", "vibe", "satisfaction"))
col_stress <- find_col(c("stress", "anxiety", "pressure"))
col_hours  <- find_col(c("hour", "time", "study", "duration"))

# Helper to get a numeric column responsibly (cycling)
get_num_col <- function(index) {
  if (ncol(good_nums) == 0) return(names(all_nums)[1])
  col_idx <- ((index - 1) %% ncol(good_nums)) + 1
  return(names(good_nums)[col_idx])
}

save_plot <- function(plot_obj, name) {
  ggsave(filename = paste0(output_dir, "/", name, ".png"), 
         plot = plot_obj, width = 8, height = 6, dpi = 100)
}

# --- AESTHETICS SETUP ---
custom_theme <- theme_minimal(base_size = 14) +
  theme(
    plot.title = element_text(face = "bold", color = "#1e293b", margin = margin(b = 10)),
    plot.subtitle = element_text(color = "#64748b", size = 10, margin = margin(b = 10)),
    axis.title = element_text(color = "#475569", face = "bold"),
    axis.text = element_text(color = "#64748b"),
    panel.grid.minor = element_blank(),
    panel.grid.major = element_line(color = "#e2e8f0"),
    legend.position = "top"
  )

# --- GENERATE 10 DIVERSE CHARTS ---
N <- nrow(data)
is_small_data <- N < 30

# 1. Grade Distribution
# Priority: col_grade -> First Good Num
target_col <- ifelse(!is.null(col_grade), col_grade, get_num_col(1))
p1 <- ggplot(data, aes(x = !!sym(target_col)))
if (is_small_data) {
  # Dotplot for small data
  p1 <- p1 + geom_dotplot(binaxis='x', stackdir='center', fill="#3b82f6", color="white")
} else {
  # Histogram for big data
  p1 <- p1 + geom_histogram(fill="#3b82f6", color="white", bins=20)
}
p1 <- p1 + custom_theme + labs(title=paste("1. Distribution of", target_col), subtitle=paste("Analysis of", N, "records"))
save_plot(p1, "chart_01_histogram")

# 2. Mood/Score Density
# Priority: col_mood -> col_stress -> Second Good Num
target_col <- ifelse(!is.null(col_mood), col_mood, 
              ifelse(!is.null(col_stress), col_stress, get_num_col(2)))
p2 <- ggplot(data, aes(x = !!sym(target_col)))
if (is_small_data) {
  # Density plot breaks on small N, use Area/Bar
  p2 <- p2 + geom_density(fill="#f59e0b", alpha=0.5, bw="SJ") # SJ bandwidth handles density better often
} else {
  p2 <- p2 + geom_density(fill="#f59e0b", alpha=0.5)
}
p2 <- p2 + custom_theme + labs(title=paste("2. Density of", target_col))
save_plot(p2, "chart_02_density")

# 3. Boxplot: Grade/Score Analysis
# Priority: Grade
target_col <- ifelse(!is.null(col_grade), col_grade, get_num_col(3))
p3 <- ggplot(data, aes(y = !!sym(target_col))) + 
      geom_boxplot(fill="#8b5cf6", alpha=0.6, outlier.color = "red") +
      custom_theme + labs(title=paste("3. Boxplot of", target_col))
save_plot(p3, "chart_03_boxplot")

# 4. Correlation Scatter: Hours vs Grade (or similar)
# Priority: Hours vs Grade -> Num1 vs Num2
x_col <- ifelse(!is.null(col_hours), col_hours, get_num_col(1))
y_col <- ifelse(!is.null(col_grade), col_grade, get_num_col(2))

# Avoid x=y
if (x_col == y_col) y_col <- get_num_col(3)

p4 <- ggplot(data, aes(x = !!sym(x_col), y = !!sym(y_col))) + 
      geom_point(color="#ef4444", size=3, alpha=0.7) + 
      geom_smooth(method="lm", se=FALSE, color="#1e293b", linetype="dashed") +
      custom_theme + labs(title=paste("4. Relationship:", x_col, "vs", y_col))
save_plot(p4, "chart_04_scatter")

# 5. Stress/Vibe Violin
# Priority: Stress -> Mood -> Num 4
target_col <- ifelse(!is.null(col_stress), col_stress, 
              ifelse(!is.null(col_mood), col_mood, get_num_col(4)))
p5 <- ggplot(data, aes(x = "", y = !!sym(target_col))) + 
      geom_violin(fill="#10b981", alpha=0.8) + 
      geom_boxplot(width=0.1, fill="white", alpha=0.5) + # Add box inside violin
      custom_theme + labs(title=paste("5. Distribution Shape of", target_col))
save_plot(p5, "chart_05_violin")

# 6. Categorical Breakdown (Bar)
if (ncol(all_cats) > 0) {
  cat_col <- names(all_cats)[1]
  p6 <- ggplot(data, aes(x = !!sym(cat_col))) + 
        geom_bar(fill="#ec4899") + 
        custom_theme + labs(title=paste("6. Counts by", cat_col))
} else {
  p6 <- ggplot(head(data, 15), aes(x = reorder(seq_along(!!sym(target_col)), !!sym(target_col)), y = !!sym(target_col))) + 
        geom_col(fill="#ec4899") + 
        custom_theme + labs(title="6. Top Values (No Categories Found)")
}
save_plot(p6, "chart_06_bar")

# 7. Trend Over Time (Line)
# Priority: Week -> Index
time_col <- find_col(c("week", "date", "day", "month"))
y_col <- ifelse(!is.null(col_grade), col_grade, get_num_col(1))

if (!is.null(time_col)) {
  p7 <- ggplot(data, aes(x = !!sym(time_col), y = !!sym(y_col), group=1)) +
        geom_line(color="#06b6d4", size=1.2) + geom_point(color="#06b6d4", size=3) +
        custom_theme + labs(title=paste("7. Progression of", y_col, "over", time_col))
} else {
  p7 <- ggplot(data, aes(x = seq_along(!!sym(y_col)), y = !!sym(y_col))) +
        geom_line(color="#06b6d4", size=1.2) + 
        custom_theme + labs(title=paste("7. Sequential Trend of", y_col))
}
save_plot(p7, "chart_07_line")

# 8. Correlation Heatmap (Rich Data)
if (ncol(good_nums) > 1 && N > 5) {
  cormat <- cor(na.omit(good_nums))
  cormat_melt <- as.data.frame(as.table(cormat))
  p8 <- ggplot(cormat_melt, aes(Var1, Var2, fill=Freq)) + 
        geom_tile(color="white") + 
        scale_fill_gradient2(low="#3b82f6", high="#ef4444", mid="white", midpoint=0, limit=c(-1,1)) +
        custom_theme + theme(axis.text.x = element_text(angle = 45, hjust = 1)) + 
        labs(title="8. Metric Correlations")
} else {
  p8 <- ggplot() + annotate("text", x=1, y=1, label="Not enough data for heatmap", size=6) + theme_void()
}
save_plot(p8, "chart_08_heatmap")

# 9. Complex Interaction (Hexbin/Area)
# Priority: Hours vs Stress
x_col <- ifelse(!is.null(col_hours), col_hours, get_num_col(1))
y_col <- ifelse(!is.null(col_stress), col_stress, get_num_col(3))

if (x_col != y_col) {
  p9 <- ggplot(data, aes(x = !!sym(x_col), y = !!sym(y_col)))
  if (is_small_data) {
     # Switch to Bubble Plot for small data
     p9 <- p9 + geom_point(aes(size = !!sym(y_col)), color = "#8b5cf6", alpha=0.6) +
           scale_size(range = c(3, 10))
  } else {
     # Hexbin for large data
     p9 <- p9 + geom_hex(bins=15) + scale_fill_viridis_c()
  }
  p9 <- p9 + custom_theme + labs(title=paste("9. Interaction:", x_col, "vs", y_col))
} else {
   p9 <- ggplot(data, aes(x = seq_along(!!sym(x_col)), y = !!sym(x_col))) + 
         geom_area(fill="#84cc16", alpha=0.5) + 
         custom_theme + labs(title="9. Area Chart")
}
save_plot(p9, "chart_09_hexbin")

# 10. Jitter (Category vs Numeric)
if (ncol(all_cats) > 0) {
  cat_col <- names(all_cats)[1]
  val_col <- ifelse(!is.null(col_grade), col_grade, get_num_col(1))
  
  p10 <- ggplot(data, aes(x = !!sym(cat_col), y = !!sym(val_col), color=!!sym(cat_col))) +
         geom_jitter(width=0.2, size=3) + 
         custom_theme + theme(legend.position="none") +
         labs(title=paste("10. Values by Group:", cat_col))
} else {
   # Pie Chart for small data fallback
   p10 <- ggplot(head(data, 10), aes(x="", y=!!sym(val_col), fill=as.factor(seq_along(!!sym(val_col))))) +
          geom_bar(stat="identity", width=1, color="white") + coord_polar("y", start=0) + theme_void() + 
          theme(legend.position="right") +
          labs(title="10. Composition (Sample)", fill="Entry")
}
save_plot(p10, "chart_10_jitter")

print("Success: Generated 10 charts.")