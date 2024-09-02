import pandas as pd
import matplotlib.pyplot as plt

surrealdb_data = {
    "Dataset Size": [2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000],
    "Insert (ms)": [504.14, 224.52, 356.75, 746.56, 2319.39, 3554.34, 7057.87, 21089.96, 35476.60, 71344.25, 209603.93, None],
    "Count By Year (ms)": [280.49, 278.19, 302.93, 337.72, 435.01, 574.70, 879.49, 1903.85, 3543.67, 7180.26, 17349.68, None]
}

# Data for Postgres
postgres_data = {
    "Dataset Size": [2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000],
    "Insert (ms)": [31.67, 47.98, 78.77, 144.77, 397.94, 675.20, 1345.34, 3961.04, 6888.47, 12775.88, 39303.37, 66739.28],
    "Count By Year (ms)": [0.47, 0.73, 1.37, 2.40, 6.04, 12.57, 23.88, 59.87, 43.52, 130.27, 392.44, 759.63]
}

# Convert to DataFrames
surrealdb_df = pd.DataFrame(surrealdb_data)
postgres_df = pd.DataFrame(postgres_data)

# Plot Insert Times
plt.figure(figsize=(10, 6))
plt.plot(surrealdb_df["Dataset Size"], surrealdb_df["Insert (ms)"], label="SurrealDB Insert", color="#ff009e") # SurrealDB Color
plt.plot(postgres_df["Dataset Size"], postgres_df["Insert (ms)"], label="Postgres Insert", color="#0064a5") # Postgres Color

# Mark DNF for SurrealDB with an 'X'
plt.scatter([5000000], [209603.93], color="#ff009e", marker='x', s=100)

plt.xscale("log")  # Keep dataset size as log scale for better readability
plt.xlabel("Dataset Size")
# plt.yscale("log", base=2)  # Use log2 scale for the y-axis
plt.ylabel("Insert Time (ms)")
plt.gca().invert_yaxis()  # Invert the y-axis
plt.title("SurrealDB vs Postgres Insert Time")
plt.legend()
plt.grid(True, which="both", linestyle='--', linewidth=0.5)
plt.savefig('insert_time.png')

# Plot Count By Year Times
plt.figure(figsize=(10, 6))
plt.plot(surrealdb_df["Dataset Size"], surrealdb_df["Count By Year (ms)"], label="SurrealDB Count By Year", color="#ff009e") # SurrealDB Color
plt.plot(postgres_df["Dataset Size"], postgres_df["Count By Year (ms)"], label="Postgres Count By Year", color="#0064a5") # Postgres Color

# Mark DNF for SurrealDB with an 'X'
plt.scatter([5000000], [17349.68], color="#ff009e", marker='x', s=100)

plt.xscale("log")  # Keep dataset size as log scale for better readability
# plt.yscale("log", base=2)  # Use log2 scale for the y-axis
plt.xlabel("Dataset Size")
plt.ylabel("Count By Year Time (ms)")
plt.gca().invert_yaxis()  # Invert the y-axis
plt.title("SurrealDB vs Postgres Count By Year Time")
plt.legend()
plt.grid(True, which="both", linestyle='--', linewidth=0.5)
plt.savefig('count_by_year.png')
