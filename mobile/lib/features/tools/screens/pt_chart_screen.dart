import 'package:flutter/material.dart';

import 'package:gap/gap.dart';

class PTChartScreen extends StatefulWidget {
  const PTChartScreen({super.key});

  @override
  State<PTChartScreen> createState() => _PTChartScreenState();
}

class _PTChartScreenState extends State<PTChartScreen> {
  String selectedGas = 'R32';
  double currentPressure = 0.0;
  final ScrollController _rulerController = ScrollController();

  // Physics parameters
  final double pixelsPerBar = 100.0; // 1 Bar = 100px height
  final double maxPressure = 60.0;

  @override
  void initState() {
    super.initState();
    _rulerController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _rulerController.removeListener(_onScroll);
    _rulerController.dispose();
    super.dispose();
  }

  void _onScroll() {
    // Current center position
    // Since we scroll DOWN to increase pressure?
    // Usually Rulers: 0 at top or bottom?
    // Image shows 0 at bottom? No, image has 0 at 3/4 way down, 1 above it.
    // So Values INCREASE as you go UP?
    // Or Values INCREASE as you go DOWN?
    // Standard UI scrolling: Top is 0, Down is +N.
    // But rulers usually have 0 at bottom.
    // Let's implement: Top = 0 Bar, Scroll Down -> Increases Bar.
    // Wait, the image shows:
    // ...
    // 2
    // 1
    // 0
    // So higher numbers are ABOVE.
    // This is like a "Reverse" list. contentOffset 0 is at bottom?
    // I will use a ListView.builder normally, but I will reverse logic or just sort indices 0..N from Top.
    // If I scroll DOWN (swipe up), I see higher numbers.
    // So 0 is at TOP.
    // Image:
    // 0.5
    // --
    // 1
    // --
    // 1.5
    // --
    // 2

    // Oh, the image shows 0.5 ABOVE 1? No.
    // "0.5 .. 1 ... 1.5 ... 2 ... 6" (going down).
    // So 0 is at Top.
    // Let's stick to simple: 0 at Top. Increasing downwards.

    // Offset 0 = 0 Bar.
    // Offset +N = +Pressure.
    // But we want the "Reading Line" (Center of screen) to determine the value.
    // So Value = (Offset + ScreenHeight/2) / pxPerBar.
    // Actually, usually the list starts with a padding of ScreenHeight/2 so that 0 aligns with center.

    // Let's refine calculation in build.
    setState(() {
      // Approximate pressure for digital display
      // We need context height. approximate for now.
    });
  }

  @override
  Widget build(BuildContext context) {
    final primaryRed = const Color(0xFFD32F2F);
    final primaryBlue = const Color(0xFF1976D2);

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(
        title: const Text(
          'Thước kéo tra môi chất Lạnh',
          style: TextStyle(
            color: Colors.black,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
        iconTheme: const IconThemeData(color: Colors.black),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(
              color: primaryRed,
              shape: BoxShape.circle,
            ),
            child: IconButton(
              icon: const Icon(Icons.tune, color: Colors.white),
              onPressed: () {},
            ),
          ),
        ],
      ),
      body: Row(
        children: [
          // Left: Ruler (38% width approx)
          Expanded(
            flex: 38,
            child: Container(
              margin: const EdgeInsets.fromLTRB(16, 16, 0, 16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.withValues(alpha: 0.2)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 4,
                  ),
                ],
              ),
              child: Column(
                children: [
                  // Header
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      border: Border(
                        bottom: BorderSide(
                          color: Colors.grey.withValues(alpha: 0.1),
                        ),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        const Text(
                          'bar(a)',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                        const Text(
                          '°C',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                  // Ruler
                  Expanded(
                    child: Stack(
                      children: [
                        NotificationListener<ScrollNotification>(
                          onNotification: (scrollNotification) {
                            if (scrollNotification
                                is ScrollUpdateNotification) {
                              final scrollPos = _rulerController.offset;
                              double p = scrollPos / pixelsPerBar;
                              if (p < 0) p = 0;
                              setState(() {
                                currentPressure = p;
                              });
                            }
                            return true;
                          },
                          child: ListView.builder(
                            controller: _rulerController,
                            padding: EdgeInsets.symmetric(
                              vertical:
                                  MediaQuery.of(context).size.height / 2 - 140,
                            ),
                            itemCount: (maxPressure * 10).toInt() + 1,
                            itemBuilder: (context, index) {
                              final barVal = index / 10.0;
                              return SizedBox(
                                height: pixelsPerBar / 10.0,
                                child: _buildTick(
                                  barVal,
                                  primaryRed,
                                  primaryBlue,
                                ),
                              );
                            },
                          ),
                        ),
                        // Indicator
                        Center(
                          child: Container(
                            height: 60,
                            width: double.infinity,
                            decoration: BoxDecoration(
                              color: Colors.grey.withValues(alpha: 0.2),
                              border: Border(
                                top: BorderSide(
                                  color: Colors.grey.withValues(alpha: 0.5),
                                ),
                                bottom: BorderSide(
                                  color: Colors.grey.withValues(alpha: 0.5),
                                ),
                              ),
                            ),
                            child: Stack(
                              children: [
                                Center(
                                  child: Container(
                                    height: 1,
                                    color: Colors.black54,
                                  ),
                                ),
                                Positioned(
                                  left: 0,
                                  top: 10,
                                  bottom: 10,
                                  child: Container(
                                    width: 2,
                                    color: Colors.black54,
                                  ),
                                ),
                                Positioned(
                                  right: 0,
                                  top: 10,
                                  bottom: 10,
                                  child: Container(
                                    width: 2,
                                    color: Colors.black54,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Right: Info Panel (62% width)
          Expanded(
            flex: 62,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  CommonCard(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          selectedGas,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const Icon(Icons.list, color: Colors.black54),
                      ],
                    ),
                    onTap: () {},
                  ),
                  const Gap(16),

                  _buildSwitchRow('Đọng sương', true, primaryRed),
                  const Gap(8),
                  _buildSwitchRow('Tuyệt đối', true, primaryRed),

                  const Gap(16),
                  CommonCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          currentPressure.toStringAsFixed(2),
                          style: const TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const Text(
                          'bar (a)',
                          style: TextStyle(color: Colors.grey, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  const Gap(12),
                  CommonCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          _interpolatePT(
                            selectedGas,
                            currentPressure,
                          ).toStringAsFixed(2),
                          style: const TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const Text(
                          '°C',
                          style: TextStyle(color: Colors.grey, fontSize: 12),
                        ),
                      ],
                    ),
                  ),

                  const Gap(24),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 4,
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        _buildInfoRow('Nhóm an toàn', 'A1'),
                        const Gap(8),
                        _buildInfoRow('GWP-AR4', _getGWP(selectedGas)),
                        const Gap(8),
                        _buildInfoRow('ODP', '0'),
                        const Gap(8),
                        _buildInfoRow('Nhiệt độ tới hạn', '72.12 °C'),
                        const Gap(8),
                        _buildInfoRow('Điểm sôi (0 bar)', '-46.22 °C'),
                        const Gap(8),
                        _buildInfoRow('Màu', '🟠', isColorIcon: true),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTick(double barVal, Color red, Color blue) {
    bool isMajor = (barVal * 10).toInt() % 10 == 0;
    bool shouldLabel = (barVal * 10).toInt() % 5 == 0;

    return Row(
      children: [
        SizedBox(
          width: 30,
          child: shouldLabel
              ? Text(
                  barVal % 1 == 0
                      ? barVal.toInt().toString()
                      : barVal.toString(),
                  textAlign: TextAlign.end,
                  style: TextStyle(
                    color: red,
                    fontWeight: FontWeight.bold,
                    fontSize: 12 + (isMajor ? 1.0 : 0.0),
                  ),
                )
              : null,
        ),
        const Gap(6),
        Container(
          width: shouldLabel ? 12 : (isMajor ? 12 : 6),
          height: 1,
          color: red.withValues(alpha: shouldLabel ? 1.0 : 0.5),
        ),
        const Expanded(child: SizedBox()),
        Container(
          width: shouldLabel ? 12 : 6,
          height: 1,
          color: blue.withValues(alpha: shouldLabel ? 1.0 : 0.5),
        ),
        const Gap(6),
        SizedBox(
          width: 30,
          child: shouldLabel
              ? Text(
                  _interpolatePT(selectedGas, barVal).toStringAsFixed(0),
                  style: TextStyle(
                    color: blue,
                    fontSize: 12 + (isMajor ? 1.0 : 0.0),
                    fontWeight: FontWeight.w500,
                  ),
                )
              : null,
        ),
      ],
    );
  }

  Widget _buildSwitchRow(String label, bool value, Color activeColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            color: Colors.grey,
          ),
        ),
        Switch(
          value: value,
          onChanged: (v) {},
          activeTrackColor: activeColor,
          activeThumbColor: Colors.white,
        ),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value, {bool isColorIcon = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Colors.black87,
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
        isColorIcon
            ? const Icon(Icons.circle, color: Colors.orange, size: 14)
            : Text(
                value,
                style: const TextStyle(
                  fontWeight: FontWeight.normal,
                  fontSize: 13,
                ),
              ),
      ],
    );
  }

  String _getGWP(String gas) {
    if (gas == 'R32') return '675';
    if (gas == 'R410A') return '2088';
    if (gas == 'R22') return '1810';
    if (gas == 'R134a') return '1430';
    return '-';
  }

  double _interpolatePT(String gas, double pBarAbs) {
    if (pBarAbs <= 0) return -50.0;
    // Basic Table (Bar Abs, Temp C)
    final r22 = [
      [1.0, -40.8],
      [5.0, 0.5],
      [10.0, 26.0],
      [20.0, 53.0],
    ]; // Simplified for mockup
    final r410a = [
      [1.0, -51.4],
      [10.0, 0.5],
      [25.0, 33.0],
      [40.0, 53.0],
    ];
    final r32 = [
      [1.0, -51.7],
      [10.0, 0.0],
      [25.0, 32.5],
      [40.0, 52.5],
    ];
    final r134a = [
      [1.0, -26.1],
      [5.0, 15.5],
      [10.0, 39.5],
      [20.0, 67.5],
    ];

    List<List<double>> table = [];
    if (gas == 'R22') table = r22;
    if (gas == 'R410A') table = r410a;
    if (gas == 'R32') table = r32;
    if (gas == 'R134a') table = r134a;

    if (table.isEmpty) return 0.0;

    for (int i = 0; i < table.length - 1; i++) {
      if (pBarAbs >= table[i][0] && pBarAbs <= table[i + 1][0]) {
        double p1 = table[i][0];
        double t1 = table[i][1];
        double p2 = table[i + 1][0];
        double t2 = table[i + 1][1];
        return t1 + (pBarAbs - p1) * (t2 - t1) / (p2 - p1);
      }
    }
    if (pBarAbs < table.first[0]) return table.first[1];
    if (pBarAbs > table.last[0]) return table.last[1];
    return 0.0;
  }
}

class CommonCard extends StatelessWidget {
  final Widget child;
  final VoidCallback? onTap;
  const CommonCard({super.key, required this.child, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 4,
            ),
          ],
        ),
        child: child,
      ),
    );
  }
}
